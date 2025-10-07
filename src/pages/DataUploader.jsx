
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadCloud, File, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { RevenueData } from '@/api/entities';
import { Metric } from '@/api/entities';
import { UploadFile, ExtractDataFromUploadedFile } from '@/api/integrations';
import { format, startOfMonth, parseISO } from 'date-fns';

const ProcessState = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  ERROR: 'error'
};

const revenueDataSchema = {
    type: "object",
    properties: {
        records: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    "LLE-code": { type: "string" },
                    "Name of the Client": { type: "string" },
                    "Product": { type: "string" }, // Fixed: Changed "Nature" back to "Product"
                    "yyyy_mm_dd": { type: "string", description: "Date in yyyy-mm-dd format" },
                    "UoM": { type: "string" },
                    "MRR": { type: "string" },
                    "NRR": { type: "string" },
                    "Country": { type: "string" },
                    "Region": { type: "string" }
                },
                required: ["LLE-code", "Name of the Client", "yyyy_mm_dd"]
            }
        }
    },
    required: ["records"]
};

const financialMetricsSchema = {
    type: "object",
    properties: {
        records: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    "period": { type: "string", description: "Date in yyyy-mm-dd format" },
                    "region_code": { type: "string" },
                    "ebitda_percent": { type: "string" },
                    "gm_percent": { type: "string" },
                    "headcount": { type: "string" }
                },
                required: ["period", "region_code"]
            }
        }
    },
    required: ["records"]
};

// --- Uploader Component ---
const Uploader = ({ onUpload, schema, formatDescription, disabled }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [status, setStatus] = useState(ProcessState.IDLE);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setStatus(ProcessState.IDLE);
      setMessage('');
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setFileName(droppedFile.name);
      setStatus(ProcessState.IDLE);
      setMessage('');
    }
  };

  const handleUploadClick = async () => {
    if (!file) {
      setStatus(ProcessState.ERROR);
      setMessage('Please select a file first.');
      return;
    }
    await onUpload({ file, setStatus, setMessage, schema });
  };
  
  const getStatusIcon = () => {
    switch (status) {
      case ProcessState.UPLOADING:
      case ProcessState.PROCESSING:
        return <Loader className="w-8 h-8 text-light-blue-600 animate-spin" />;
      case ProcessState.SUCCESS:
        return <CheckCircle className="w-8 h-8 text-emerald-600" />;
      case ProcessState.ERROR:
        return <AlertCircle className="w-8 h-8 text-red-600" />;
      default:
        return <UploadCloud className="w-8 h-8 text-navy-500" />;
    }
  };

  return (
    <Card className="shadow-lg border-2 border-navy-200">
      <CardHeader>
        <CardTitle>Upload CSV File</CardTitle>
        <CardDescription>
          Required columns: {formatDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors duration-300 ${status === ProcessState.UPLOADING || status === ProcessState.PROCESSING ? 'bg-light-blue-50 border-light-blue-300' : 'bg-navy-50 border-navy-300 hover:border-light-blue-400 hover:bg-light-blue-50'}`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="mb-4">{getStatusIcon()}</div>
          <input type="file" id={`file-upload-${schema.properties.records.items.properties.period ? 'fin' : 'rev'}`} className="hidden" accept=".csv" onChange={handleFileChange} />
          <label htmlFor={`file-upload-${schema.properties.records.items.properties.period ? 'fin' : 'rev'}`} className="font-bold text-light-blue-600 cursor-pointer hover:underline">
            {fileName ? `Selected: ${fileName}` : 'Choose a file'}
          </label>
          <p className="text-sm text-navy-600 mt-1">or drag and drop</p>
        </div>

        {message && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-navy-100 border border-navy-200">
            {getStatusIcon()}
            <p className={`font-medium ${status === ProcessState.ERROR ? 'text-red-700' : 'text-navy-800'}`}>{message}</p>
          </div>
        )}

        <Button
          onClick={handleUploadClick}
          disabled={!file || disabled || status === ProcessState.UPLOADING || status === ProcessState.PROCESSING}
          className="w-full bg-navy-800 hover:bg-navy-900 text-white font-bold rounded-xl text-base py-6"
        >
          {status === ProcessState.UPLOADING || status === ProcessState.PROCESSING ? 'Processing...' : 'Upload and Process Data'}
        </Button>
      </CardContent>
    </Card>
  );
};


// --- Main Page Component ---
export default function DataUploaderPage() {
  const [isProcessing, setIsProcessing] = useState(false);

  // --- Revenue Data Processing ---
  const handleRevenueUpload = async ({ file, setStatus, setMessage, schema }) => {
    setIsProcessing(true);
    setStatus(ProcessState.UPLOADING);
    setMessage('Uploading revenue file...');

    try {
      const { file_url } = await UploadFile({ file });
      setStatus(ProcessState.PROCESSING);
      setMessage('File uploaded. Extracting atomic revenue data...');
      
      const extractionResult = await ExtractDataFromUploadedFile({ file_url, json_schema: schema });
      if (extractionResult.status !== 'success' || !extractionResult.output?.records) {
        throw new Error(extractionResult.details || "Failed to extract data. Check file format.");
      }
      
      const parsedData = extractionResult.output.records.map(row => ({
        lle_code: row['LLE-code'],
        client_name: row['Name of the Client'],
        product: row['Product'], // Fixed: Use 'Product' from the extracted data
        period: row['yyyy_mm_dd'] ? format(startOfMonth(parseISO(row['yyyy_mm_dd'])), 'yyyy-MM-dd') : null,
        uom: row['UoM'],
        mrr: row['MRR'] ? parseFloat(String(row['MRR']).replace(/,/g, '')) : 0,
        nrr: row['NRR'] ? parseFloat(String(row['NRR']).replace(/,/g, '')) : 0,
        country: row['Country'],
        region: row['Region']
      })).filter(row => row.period);

      if (parsedData.length === 0) throw new Error('No valid data rows found in the file.');

      setMessage(`Storing ${parsedData.length} raw data records...`);
      const oldData = await RevenueData.list();
      for(const record of oldData) await RevenueData.delete(record.id);
      await RevenueData.bulkCreate(parsedData);
      
      setMessage('Aggregating data and calculating MRR KPI...');
      await processAndStoreRevenueMetrics(parsedData);

      setStatus(ProcessState.SUCCESS);
      setMessage(`Successfully imported and processed ${parsedData.length} revenue records.`);
    } catch (error) {
      setStatus(ProcessState.ERROR);
      setMessage(`An error occurred: ${error.message}`);
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const processAndStoreRevenueMetrics = async (data) => {
    if (!data || data.length === 0) return;
    const latestDate = data.reduce((max, p) => (new Date(p.period) > new Date(max) ? p.period : max), data[0].period);
    const latestMonthData = data.filter(d => format(parseISO(d.period), 'yyyy-MM') === format(parseISO(latestDate), 'yyyy-MM'));
    const totalMrr = latestMonthData.reduce((sum, item) => sum + (item.mrr || 0), 0);
    const latestMetric = { metric_name: "MRR", period: format(startOfMonth(parseISO(latestDate)), 'yyyy-MM-dd'), value: totalMrr, currency: "INR" };
    const existing = await Metric.filter({ metric_name: 'MRR', period: latestMetric.period });
    if (existing.length > 0) await Metric.update(existing[0].id, latestMetric);
    else await Metric.create(latestMetric);
  };


  // --- Financial Data Processing ---
  const handleFinancialsUpload = async ({ file, setStatus, setMessage, schema }) => {
    setIsProcessing(true);
    setStatus(ProcessState.UPLOADING);
    setMessage('Uploading financial metrics file...');

    try {
        const { file_url } = await UploadFile({ file });
        setStatus(ProcessState.PROCESSING);
        setMessage('File uploaded. Extracting financial metrics...');

        const extractionResult = await ExtractDataFromUploadedFile({ file_url, json_schema: schema });
        if (extractionResult.status !== 'success' || !extractionResult.output?.records) {
            throw new Error(extractionResult.details || "Failed to extract financial data. Check file format.");
        }

        const parsedData = extractionResult.output.records;
        if (parsedData.length === 0) throw new Error('No valid data rows found in the file.');
        
        setMessage(`Processing ${parsedData.length} monthly records...`);
        await processAndStoreFinancialMetrics(parsedData);
        
        setStatus(ProcessState.SUCCESS);
        setMessage(`Successfully imported and processed ${parsedData.length} financial records.`);
    } catch (error) {
        setStatus(ProcessState.ERROR);
        setMessage(`An error occurred: ${error.message}`);
        console.error(error);
    } finally {
        setIsProcessing(false);
    }
  };
  
  const processAndStoreFinancialMetrics = async (data) => {
      for (const row of data) {
          const period = format(startOfMonth(parseISO(row.period)), 'yyyy-MM-dd');
          const metricsToUpsert = [
              { name: 'EBITDA %', value: row.ebitda_percent },
              { name: 'GM %', value: row.gm_percent },
              { name: 'Headcount', value: row.headcount }
          ];

          for (const metric of metricsToUpsert) {
              if (metric.value !== null && metric.value !== undefined && metric.value !== '') {
                  const metricRecord = {
                      metric_name: metric.name,
                      period: period,
                      value: parseFloat(metric.value),
                      region_code: row.region_code
                  };
                  
                  const existing = await Metric.filter({ 
                      metric_name: metricRecord.metric_name, 
                      period: metricRecord.period,
                      region_code: metricRecord.region_code
                  });

                  if (existing.length > 0) {
                      await Metric.update(existing[0].id, metricRecord);
                  } else {
                      await Metric.create(metricRecord);
                  }
              }
          }
      }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-navy-50 to-white min-h-screen">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-black text-navy-900 mb-2 tracking-tight">Data Import Hub</h1>
          <p className="text-navy-700 text-lg font-medium">Import your business data from CSV files.</p>
        </header>

        <Tabs defaultValue="revenue" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-navy-200">
            <TabsTrigger value="revenue" className="data-[state=active]:bg-white data-[state=active]:shadow-md">Atomic Revenue Data</TabsTrigger>
            <TabsTrigger value="financials" className="data-[state=active]:bg-white data-[state=active]:shadow-md">Financial & Ops Metrics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="revenue" className="mt-6">
            <Uploader 
              onUpload={handleRevenueUpload} 
              schema={revenueDataSchema} 
              formatDescription="LLE-code, Name of the Client, Product, yyyy_mm_dd, UoM, MRR, NRR, Country, Region" // Fixed: Changed "Nature" to "Product"
              disabled={isProcessing}
            />
          </TabsContent>

          <TabsContent value="financials" className="mt-6">
            <Uploader 
              onUpload={handleFinancialsUpload} 
              schema={financialMetricsSchema} 
              formatDescription="period, region_code, ebitda_percent, gm_percent, headcount"
              disabled={isProcessing}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
