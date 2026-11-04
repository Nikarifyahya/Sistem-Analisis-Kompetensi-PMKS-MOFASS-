import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Healthcheck
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Gemini-powered deep diagnostic strategy endpoint
app.post('/api/analyze-assessment', async (req: Request, res: Response) => {
  try {
    const { companyProfile, categoryScores, overallPercentage, maturityTitle } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // If no API key configured, return fallback payload smoothly
      return res.status(200).json({
        success: false,
        source: 'fallback',
        message: 'No GEMINI_API_KEY configured; using local ML diagnostic rules engine.'
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Anda adalah seorang Penasihat Strategi Perniagaan PMKS Senior (SME Business Consultant) bertauliah di Malaysia dengan kepakaran dalam kerangka diagnostik MOFASS (Marketing, Operation, Finance, Administration, Sales, System).

Berikut adalah profil dan data skor diagnostik syarikat PMKS:
- Nama Syarikat: ${companyProfile.companyName || 'PMKS Malaysia'}
- Sektor Perniagaan: ${companyProfile.sector}
- Saiz Perniagaan: ${companyProfile.businessSize}
- Tempoh Operasi: ${companyProfile.yearsInOperation || 1} tahun
- Anggaran Perolehan Tahunan: ${companyProfile.annualTurnover}
- Bilangan Pekerja: ${companyProfile.employeeCount} orang
- Lokasi: ${companyProfile.state}

Skor Diagnostik MOFASS Keseluruhan: ${overallPercentage}% (${maturityTitle})
Pecahan Skor Setiap Dimensi:
- Marketing (Pemasaran): ${categoryScores?.M?.percentage}% (Status: ${categoryScores?.M?.status})
- Operation (Operasi): ${categoryScores?.O?.percentage}% (Status: ${categoryScores?.O?.status})
- Finance (Kewangan): ${categoryScores?.F?.percentage}% (Status: ${categoryScores?.F?.status})
- Administration (Pentadbiran/HR): ${categoryScores?.A?.percentage}% (Status: ${categoryScores?.A?.status})
- Sales (Jualan): ${categoryScores?.S_SALES?.percentage}% (Status: ${categoryScores?.S_SALES?.status})
- System (Sistem IT): ${categoryScores?.S_SYSTEM?.percentage}% (Status: ${categoryScores?.S_SYSTEM?.status})

TUGASAN ANDA:
Hasilkan analisis pengesyoran strategi pertumbuhan yang diperibadikan, berwibawa, dan praktikal dalam format JSON SAHAJA:
{
  "executiveSummary": "Rumusan eksekutif mendalam (2 perenggan) menilai punca kekangan syarikat dan potensi lonjakan skala perniagaan",
  "competitiveEdge": "Analisis kelebihan daya saing berdasarkan skor tertinggi mereka",
  "criticalBottlenecks": ["3 jurang atau risiko terbesar yang membahayakan kelangsungan syarikat jika tidak dirawat segera"],
  "aiActionRoadmap": [
    {
      "timeframe": "30 Hari (Quick Wins)",
      "actionTitle": "Tajuk tindakan pantas",
      "impact": "Unjuran impak",
      "steps": ["Langkah 1", "Langkah 2"]
    },
    {
      "timeframe": "60 Hari (Pengukuhan Sistem)",
      "actionTitle": "Tajuk tindakan penambahbaikan proses",
      "impact": "Unjuran impak",
      "steps": ["Langkah 1", "Langkah 2"]
    },
    {
      "timeframe": "90 Hari (Penskalaan Strategik)",
      "actionTitle": "Tajuk tindakan penskalaan pasaran",
      "impact": "Unjuran impak",
      "steps": ["Langkah 1", "Langkah 2"]
    }
  ],
  "projectedRevenueGrowth": "Contoh: +20% hingga +35% dalam tempoh 12 bulan",
  "recommendedAgencies": ["Senarai agensi Malaysia yang tepat cth: SME Corp BAP, MDEC Digital Grant, MARA SPiM, dsb."]
}
HANYA kembalikan teks JSON yang sah tanpa markdown formatting lain.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text || '{}';
    let parsedData = {};
    try {
      parsedData = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) parsedData = JSON.parse(match[0]);
    }

    return res.status(200).json({
      success: true,
      source: 'gemini-3.8-flash',
      data: parsedData
    });
  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(200).json({
      success: false,
      source: 'fallback',
      error: error instanceof Error ? error.message : 'Error generating AI strategy',
    });
  }
});

// Gemini-powered Industry Landscape analysis based on Sector and Years in Operation
app.post('/api/generate-industry-landscape', async (req: Request, res: Response) => {
  try {
    const { companyProfile } = req.body;
    if (!companyProfile) {
      return res.status(400).json({ success: false, error: 'companyProfile is required' });
    }

    const sector = companyProfile.sector || 'Teknologi & Digital';
    const years = Number(companyProfile.yearsInOperation) || 1;
    let stageCategory = 'Fasa Permulaan & Pembinaan Pasaran Asas (Tahun 1-2)';
    if (years >= 10) {
      stageCategory = 'Fasa Pemantapan & Transformasi Digital/IR4.0 (10+ Tahun)';
    } else if (years >= 6) {
      stageCategory = 'Fasa Kematangan & Penskalaan Pasaran (Tahun 6-9)';
    } else if (years >= 3) {
      stageCategory = 'Fasa Pengukuhan Sistem & Pertumbuhan Awal (Tahun 3-5)';
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        success: false,
        source: 'fallback',
        message: 'No GEMINI_API_KEY configured; fallback to local intelligence engine.'
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Anda adalah seorang Pakar Analisis Pasaran & Landskap Industri PMKS Malaysia (Senior Industry & Market Intelligence Consultant) yang bertauliah.

Sila hasilkan analisis pasaran dan landskap industri mendalam serta profesional bagi entiti perniagaan PMKS ini:
- Nama Syarikat: ${companyProfile.companyName || 'PMKS Malaysia'}
- Sektor Perniagaan: ${sector}
- Tempoh Beroperasi: ${years} tahun (${stageCategory})
- Saiz Perniagaan: ${companyProfile.businessSize || 'Kecil'}
- Perolehan Tahunan: ${companyProfile.annualTurnover || 'RM 500,000'}
- Jumlah Tenaga Kerja: ${companyProfile.employeeCount || 5} pekerja
- Lokasi Operasi: ${companyProfile.state || 'Selangor'}
- Keterangan Perniagaan: ${companyProfile.briefDescription || 'Penyedia produk/perkhidmatan PMKS tempatan'}

ARAHAN KHUSUS & KRITIKAL:
Ulasan anda MESTILAH menghubungkaitkan secara spesifik antara SEKTOR INDUSTRI (${sector}) dan TEMPOH OPERASI (${years} TAHUN). 
- Jelaskan cabaran sebenar yang dihadapi pemain perniagaan di Malaysia yang berada dalam fasa umur operasi ${years} tahun (contohnya cabaran aliran tunai & validasi pasaran untuk 1-2 tahun; kebergantungan kepada pengasas & pembinaan SOP untuk 3-5 tahun; pembaharuan teknologi/e-Invois LHDN, kepenatan produk & penggantian legasi untuk 6+ tahun).
- Sertakan trend pasaran semasa terkini di Malaysia termasuk transaksi tanpa tunai, automasi e-Invois LHDN, pemasaran digital, dan desakan kos operasi.
- Sertakan program bantuan atau dasar sokongan kerajaan Malaysia yang paling tepat bagi sektor dan fasa umur ini (cth: SME Corp BAP, MDEC Digital Grant, KUSKOP, MITI, Agrobank, CIDB, MATRADE, SJPP).

Kembalikan jawapan dalam format JSON SAHAJA mengikut struktur berikut:
{
  "sectorOverview": "Ulasan landskap makro sektor ${sector} di Malaysia (2 perenggan), membincangkan saiz pasaran, dinamik persaingan, dan realiti perniagaan semasa.",
  "stageAnalysis": "Ulasan khusus analisis fasa kematangan berdasarkan ${years} tahun beroperasi dalam sektor ${sector}, menerangkan kelebihan persaingan serta risiko transisi fasa syarikat.",
  "marketTrends": [
    "Trend utama 1 spesifik sektor ${sector} di Malaysia",
    "Trend utama 2 berkaitan pendigitalan, tingkah laku pengguna atau e-Invois",
    "Trend utama 3 berkaitan rantaian bekalan atau model perniagaan baharu"
  ],
  "keyChallenges": [
    "Cabaran utama 1 yang dihadapi oleh syarikat fasa ${years} tahun dalam sektor ${sector}",
    "Cabaran utama 2 berkaitan overhed kos operasi, bekalan bahan, atau aliran tunai",
    "Cabaran utama 3 berkaitan bakat pekerja berkemahiran atau pengekalan pelanggan"
  ],
  "governmentPolicySupport": [
    "Dasar/Inisiatif kerajaan 1 (agensi berkaitan sektor ${sector} seperti SME Corp, MDEC, MITI, dll.)",
    "Dasar/Inisiatif kerajaan 2 (geran padanan automasi, pensijilan, atau latihan HRD Corp)",
    "Skim jaminan kredit atau kemudahan pembiayaan institusi berkaitan (cth: SJPP, MARA, Agrobank)"
  ],
  "growthDrivers": [
    "Pemangkin pertumbuhan 1 untuk melonjakkan skala dan kecekapan syarikat",
    "Pemangkin pertumbuhan 2 melalui perkongsian strategik atau pensijilan kualiti",
    "Pemangkin pertumbuhan 3 menembusi pasaran korporat atau eksport serantau ASEAN"
  ]
}
HANYA kembalikan objek JSON yang sah tanpa teks lain atau markdown formatting tambahan.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text || '{}';
    let parsedData: any = {};
    try {
      parsedData = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) parsedData = JSON.parse(match[0]);
    }

    return res.status(200).json({
      success: true,
      source: 'gemini-3.8-flash',
      data: {
        ...parsedData,
        yearsInOperation: years,
        source: 'gemini-ai',
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Gemini Industry Landscape API Error:', error);
    return res.status(200).json({
      success: false,
      source: 'fallback',
      error: error instanceof Error ? error.message : 'Error generating AI industry analysis'
    });
  }
});

// Setup Vite dev server or static middleware
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
