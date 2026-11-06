import { 
  MofassCategoryId, 
  CategoryScoreResult, 
  CompetencyLevelGrade, 
  AssessmentResult, 
  CompanyProfile, 
  UserProfile, 
  ActionPlanItem, 
  GovernmentProgram,
  IndustryLandscapeData,
  ElementDeepAnalysis,
  StrategicBlueprint,
  StrategicKPI,
  DetailedActionPlan
} from '../types';
import { 
  MOFASS_CATEGORIES, 
  MATURITY_LEVEL_BENCHMARKS, 
  GOVERNMENT_PROGRAMS_CATALOG 
} from '../data/mofassQuestions';

export function calculateAssessmentScores(
  answers: Record<string, number>,
  companyProfile: CompanyProfile,
  userProfile: UserProfile
): AssessmentResult {
  const categoryScores: Record<MofassCategoryId, CategoryScoreResult> = {} as any;
  let totalScore = 0;
  const maxPossibleTotal = 300; // 6 * 50

  const allStrengths: string[] = [];
  const allWeaknesses: string[] = [];

  MOFASS_CATEGORIES.forEach((cat) => {
    let catRawScore = 0;
    const catMaxScore = cat.questions.length * 5; // 50
    const keyGaps: string[] = [];
    const keyStrengths: string[] = [];

    cat.questions.forEach((q) => {
      const val = answers[q.id] || 3; // default neutral if unselected
      catRawScore += val;

      if (val <= 2) {
        keyGaps.push(`${q.text.replace(/Syarikat kami /i, '')}`);
        allWeaknesses.push(`[${cat.shortName}] ${q.text.replace(/Syarikat kami /i, '')}`);
      } else if (val >= 4) {
        keyStrengths.push(`${q.text.replace(/Syarikat kami /i, '')}`);
        allStrengths.push(`[${cat.shortName}] ${q.text.replace(/Syarikat kami /i, '')}`);
      }
    });

    totalScore += catRawScore;
    const percentage = Math.round((catRawScore / catMaxScore) * 100);

    let levelGrade: CompetencyLevelGrade = 'Tahap 1';
    let levelLabel = 'Tahap Asas';
    let status: 'Kritikal' | 'Perlu Pembaikan' | 'Memuaskan' | 'Cemerlang' = 'Kritikal';

    if (percentage >= 85) {
      levelGrade = 'Tahap 4';
      levelLabel = 'Cemerlang / Peneraju';
      status = 'Cemerlang';
    } else if (percentage >= 70) {
      levelGrade = 'Tahap 3';
      levelLabel = 'Kompeten & Mampan';
      status = 'Memuaskan';
    } else if (percentage >= 50) {
      levelGrade = 'Tahap 2';
      levelLabel = 'Membangun';
      status = 'Perlu Pembaikan';
    } else {
      levelGrade = 'Tahap 1';
      levelLabel = 'Tahap Asas / Berisiko';
      status = 'Kritikal';
    }

    categoryScores[cat.id] = {
      categoryId: cat.id,
      categoryName: cat.name,
      score: catRawScore,
      maxScore: catMaxScore,
      percentage,
      levelGrade,
      levelLabel,
      status,
      keyGaps: keyGaps.slice(0, 3),
      keyStrengths: keyStrengths.slice(0, 3)
    };
  });

  const overallPercentage = Math.round((totalScore / maxPossibleTotal) * 100);

  let maturityLevel: CompetencyLevelGrade = 'Tahap 1';
  let maturityTitle = MATURITY_LEVEL_BENCHMARKS.tahap1.name;
  let maturityDescription = MATURITY_LEVEL_BENCHMARKS.tahap1.summary;

  if (overallPercentage >= 85) {
    maturityLevel = 'Tahap 4';
    maturityTitle = MATURITY_LEVEL_BENCHMARKS.tahap4.name;
    maturityDescription = MATURITY_LEVEL_BENCHMARKS.tahap4.summary;
  } else if (overallPercentage >= 70) {
    maturityLevel = 'Tahap 3';
    maturityTitle = MATURITY_LEVEL_BENCHMARKS.tahap3.name;
    maturityDescription = MATURITY_LEVEL_BENCHMARKS.tahap3.summary;
  } else if (overallPercentage >= 50) {
    maturityLevel = 'Tahap 2';
    maturityTitle = MATURITY_LEVEL_BENCHMARKS.tahap2.name;
    maturityDescription = MATURITY_LEVEL_BENCHMARKS.tahap2.summary;
  }

  // Sorted categories by percentage ascending (lowest first)
  const sortedCategories = Object.values(categoryScores).sort((a, b) => a.percentage - b.percentage);
  const lowestCat = sortedCategories[0];
  const secondLowestCat = sortedCategories[1];
  const highestCat = sortedCategories[sortedCategories.length - 1];

  // Matched Government Programs based on weak categories
  const targetCategoryIds = [lowestCat.categoryId, secondLowestCat.categoryId];
  const matchedGovPrograms: GovernmentProgram[] = GOVERNMENT_PROGRAMS_CATALOG.filter((prog) =>
    prog.targetCategory.some((tc) => targetCategoryIds.includes(tc))
  );

  // SWOT Analysis
  const swotAnalysis = {
    strengths: allStrengths.length > 0 
      ? allStrengths.slice(0, 6) 
      : ['Komitmen pemilik perniagaan untuk memajukan operasi', 'Potensi pasaran produk sedia ada', 'Kepuasan asas pelanggan'],
    weaknesses: allWeaknesses.length > 0 
      ? allWeaknesses.slice(0, 6) 
      : ['Kekurangan dokumentasi formal SOP kerja', 'Sistem penjejakan data jualan belum berpusat', 'Kawalan kredit penghutang belum ketat'],
    opportunities: [
      `Pertumbuhan permintaan domestik dan serantau dalam sektor ${companyProfile.sector}`,
      'Peralihan ke arah pematuhan e-Invois LHDN dan platform e-dagang omnisaluran',
      'Inisiatif geran pembiayaan padanan pendigitalan PMKS (MDEC, SME Corp, MARA, TEKUN)',
      'Potensi pembekal rantaian nilai (vendor) kepada syarikat senaraian awam (PLC) dan GLC'
    ],
    threats: [
      'Kenaikan kos bahan mentah, utiliti dan overhed operasi yang menekan margin keuntungan',
      'Persaingan daripada syarikat yang telah mengautomasikan operasi sepenuhnya dan memiliki modal besar',
      'Kelewatan aliran tunai kutipan penghutang yang menjejaskan kecairan operasi bulanan',
      'Pusing ganti (turnover) pekerja mahir yang tinggi dalam pasaran buruh tempatan'
    ]
  };

  // Generate Industry Landscape
  const industryLandscape = generateIndustryLandscape(companyProfile);

  // Generate Element Deep Analyses
  const elementDeepAnalyses = generateElementDeepAnalyses(categoryScores, answers);

  // Generate Strategic Blueprint (Vision, Pillars, KPIs, Detailed Action Plan, Budget)
  const strategicBlueprint = generateStrategicBlueprint(companyProfile, categoryScores, overallPercentage);

  // Generate 30-60-90 Day Growth Roadmap
  const growthRoadmap = generateGrowthRoadmap(categoryScores, companyProfile);

  // AI / ML Executive Summary
  const aiExecutiveSummary = generateExecutiveSummary(
    companyProfile, 
    overallPercentage, 
    maturityTitle, 
    lowestCat, 
    highestCat
  );

  const assessmentId = `MOFASS-AUDIT-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  return {
    id: assessmentId,
    userId: userProfile.uid,
    userEmail: userProfile.email,
    companyProfile,
    userProfile,
    answers,
    categoryScores,
    totalScore,
    overallPercentage,
    maturityLevel,
    maturityTitle,
    maturityDescription,
    industryLandscape,
    elementDeepAnalyses,
    strategicBlueprint,
    swotAnalysis,
    growthRoadmap,
    matchedGovPrograms,
    aiExecutiveSummary,
    createdAt: new Date().toISOString()
  };
}

export function ensureCompleteAssessment(rawAssessment: AssessmentResult): AssessmentResult {
  if (!rawAssessment) return rawAssessment;

  const company: CompanyProfile = rawAssessment.companyProfile || {
    companyName: 'Nusantara Global Tech Solutions Sdn Bhd',
    ssmNumber: '202101034567 (1435890-X)',
    sector: 'Teknologi & Digital',
    businessSize: 'Kecil (RM300k - RM15m / 5 - 75 Pekerja)',
    yearsInOperation: 4,
    annualTurnover: 'RM 1,250,000',
    employeeCount: 14,
    state: 'Selangor',
    district: 'Shah Alam',
    website: 'https://nusantaratech.com.my',
    briefDescription: 'Penyedia automasi dan perisian pengurusan inventori pintar PMKS.'
  };

  const user: UserProfile = rawAssessment.userProfile || {
    uid: rawAssessment.userId || 'demo-pmks-user-001',
    fullName: 'Nik Arif Yahya',
    email: rawAssessment.userEmail || 'nikarifyahya@gmail.com',
    role: 'Pengarah Urusan'
  };

  const rawScores = rawAssessment.categoryScores || ({} as any);
  const defaultCategoryScores: Record<MofassCategoryId, CategoryScoreResult> = {
    M: { categoryId: 'M', categoryName: 'Marketing (Pemasaran)', score: 35, maxScore: 50, percentage: 70, levelGrade: 'Tahap 3', levelLabel: 'Kompeten & Mampan', status: 'Memuaskan', keyGaps: [], keyStrengths: [] },
    O: { categoryId: 'O', categoryName: 'Operation (Operasi)', score: 35, maxScore: 50, percentage: 70, levelGrade: 'Tahap 3', levelLabel: 'Kompeten & Mampan', status: 'Memuaskan', keyGaps: [], keyStrengths: [] },
    F: { categoryId: 'F', categoryName: 'Finance (Kewangan)', score: 35, maxScore: 50, percentage: 70, levelGrade: 'Tahap 3', levelLabel: 'Kompeten & Mampan', status: 'Memuaskan', keyGaps: [], keyStrengths: [] },
    A: { categoryId: 'A', categoryName: 'Administration (Pentadbiran)', score: 35, maxScore: 50, percentage: 70, levelGrade: 'Tahap 3', levelLabel: 'Kompeten & Mampan', status: 'Memuaskan', keyGaps: [], keyStrengths: [] },
    S_SALES: { categoryId: 'S_SALES', categoryName: 'Sales (Jualan)', score: 35, maxScore: 50, percentage: 70, levelGrade: 'Tahap 3', levelLabel: 'Kompeten & Mampan', status: 'Memuaskan', keyGaps: [], keyStrengths: [] },
    S_SYSTEM: { categoryId: 'S_SYSTEM', categoryName: 'System (Sistem & Teknologi)', score: 35, maxScore: 50, percentage: 70, levelGrade: 'Tahap 3', levelLabel: 'Kompeten & Mampan', status: 'Memuaskan', keyGaps: [], keyStrengths: [] },
  };

  const categoryScores: Record<MofassCategoryId, CategoryScoreResult> = {
    M: rawScores.M || defaultCategoryScores.M,
    O: rawScores.O || defaultCategoryScores.O,
    F: rawScores.F || defaultCategoryScores.F,
    A: rawScores.A || defaultCategoryScores.A,
    S_SALES: rawScores.S_SALES || defaultCategoryScores.S_SALES,
    S_SYSTEM: rawScores.S_SYSTEM || defaultCategoryScores.S_SYSTEM,
  };
  const overallPercentage = rawAssessment.overallPercentage || 70;

  const defaultLandscape = generateIndustryLandscape(company);
  const indLandscape = rawAssessment.industryLandscape;

  const industryLandscape: IndustryLandscapeData = {
    sectorOverview: (indLandscape?.sectorOverview && indLandscape.sectorOverview.trim().length > 20)
      ? indLandscape.sectorOverview
      : defaultLandscape.sectorOverview,
    stageAnalysis: indLandscape?.stageAnalysis || defaultLandscape.stageAnalysis,
    yearsInOperation: indLandscape?.yearsInOperation || company.yearsInOperation || 1,
    source: indLandscape?.source || 'ml-rules',
    generatedAt: indLandscape?.generatedAt || new Date().toISOString(),
    marketTrends: (indLandscape?.marketTrends && indLandscape.marketTrends.length > 0)
      ? indLandscape.marketTrends
      : defaultLandscape.marketTrends,
    keyChallenges: (indLandscape?.keyChallenges && indLandscape.keyChallenges.length > 0)
      ? indLandscape.keyChallenges
      : defaultLandscape.keyChallenges,
    governmentPolicySupport: (indLandscape?.governmentPolicySupport && indLandscape.governmentPolicySupport.length > 0)
      ? indLandscape.governmentPolicySupport
      : defaultLandscape.governmentPolicySupport,
    growthDrivers: (indLandscape?.growthDrivers && indLandscape.growthDrivers.length > 0)
      ? indLandscape.growthDrivers
      : defaultLandscape.growthDrivers,
  };

  const elementDeepAnalyses = (rawAssessment.elementDeepAnalyses && Object.keys(rawAssessment.elementDeepAnalyses).length === 6)
    ? rawAssessment.elementDeepAnalyses
    : generateElementDeepAnalyses(categoryScores, rawAssessment.answers || {});

  const strategicBlueprint = (rawAssessment.strategicBlueprint && (rawAssessment.strategicBlueprint.kpis?.length ?? 0) > 0)
    ? rawAssessment.strategicBlueprint
    : generateStrategicBlueprint(company, categoryScores, overallPercentage);

  return {
    ...rawAssessment,
    companyProfile: company,
    userProfile: user,
    industryLandscape,
    elementDeepAnalyses,
    strategicBlueprint,
  };
}

export function generateIndustryLandscape(company: CompanyProfile): IndustryLandscapeData {
  const sector = company.sector || 'Teknologi & Digital';
  const years = company.yearsInOperation || 1;

  let stageLabel = 'Fasa Permulaan & Pembinaan Pasaran Asas (Tahun 1-2)';
  let stageAnalysis = `Berdasarkan tempoh operasi ${years} tahun, syarikat berada dalam ${stageLabel}. Keutamaan strategik utama ialah pengesahan model bisnes, kestabilan aliran tunai pusingan, dan pembinaan reputasi pasaran awal.`;

  if (years >= 10) {
    stageLabel = 'Fasa Pemantapan Legasi & Transformasi IR4.0 (10+ Tahun)';
    stageAnalysis = `Dengan pengalaman beroperasi selama ${years} tahun, syarikat tergolong dalam ${stageLabel}. Fokus kritikal kini tertumpu kepada automasi proses kerja moden, pematuhan kawal selia terkini (e-Invois LHDN & ESG), dan peluasan pasaran ke peringkat serantau ASEAN.`;
  } else if (years >= 6) {
    stageLabel = 'Fasa Kematangan & Penskalaan Operasi (Tahun 6-9)';
    stageAnalysis = `Memasuki tempoh operasi ${years} tahun, syarikat kini berada dalam ${stageLabel}. Cabaran utama fasa ini ialah mengatasi kekangan kecekapan kos, menstrukturkan semula organisasi, dan mengurangkan kos seunit melalui automasi teknologi.`;
  } else if (years >= 3) {
    stageLabel = 'Fasa Pengukuhan Sistem & Pertumbuhan Awal (Tahun 3-5)';
    stageAnalysis = `Dengan rekod operasi selama ${years} tahun, syarikat kini berada dalam ${stageLabel}. Fokus kritikal ialah pembinaan SOP bertulis, mengurangkan kebergantungan kepada pengasas perniagaan, serta mengintegrasikan perisian digital bagi menyokong lonjakan jualan.`;
  }

  let sectorOverview = `Sektor ${sector} di Malaysia menyumbang secara signifikan kepada Keluaran Dalam Negara Kasar (KDNK) negara, mewakili lebih 38% daripada keseluruhan ekosistem PMKS. Dalam fasa operasi syarikat yang telah menjangkau ${years} tahun (${stageLabel}), entiti perniagaan perlu menyeimbangkan antara pengurusan kos overhed operasi dan pematuhan kawal selia digital termasuk mandat e-Invois LHDN dan integriti data.`;

  let marketTrends = [
    'Peningkatan kebergantungan kepada platform transaksi digital, CRM awan, dan automasi proses berulang.',
    'Peralihan kuasa beli pelanggan kepada tawaran yang telus nilai harga, kelajuan servis dan kepuasan masa nyata.',
    'Penekanan ketat kepada pematuhan Akta Perlindungan Data Peribadi (PDPA) dan integriti aliran rekod inventori.'
  ];

  let keyChallenges = [
    'Kenaikan kos overhed buruh, kenaikan kadar sewa premis, dan ketidaktentuan harga input bahan mentah.',
    'Kekangan aliran tunai pusingan berpunca daripada tempoh kutipan kredit penghutang yang panjang (>45 hari).',
    'Kesukaran menarik dan mengekalkan bakat berkemahiran teknikal serta ketiadaan SOP bertulis yang konsisten.'
  ];

  let governmentPolicySupport = [
    'Pelan Induk PKS (SME Masterplan) dan Dasar Keusahawanan Nasional (DKN 2030).',
    'Inisiatif automasi dan pendigitalan pintar PMKS diterajui SME Corp, MDEC, dan Kementerian Pembangunan Usahawan & Koperasi (KUSKOP).',
    'Skim Jaminan Modal Kerja (WCS) oleh Syarikat Jaminan Pembiayaan Perniagaan (SJPP).'
  ];

  let growthDrivers = [
    'Peluang menembusi rantaian pembekal korporat melalui pensijilan kualiti diiktiraf (Halal JAKIM, ISO 9001, MeSTI).',
    'Peluasan pasaran ke peringkat serantau ASEAN melalui saluran e-dagang rentas sempadan.',
    'Automasi proses berulang yang mengurangkan kos operasi seunit sebanyak 15% hingga 25%.'
  ];

  if (sector.includes('Teknologi') || sector.includes('Digital')) {
    sectorOverview = `Sektor Teknologi & Digital di Malaysia berkembang pesat dengan sasaran menyumbang 25.5% kepada KDNK negara di bawah Rangka Tindakan Ekonomi Digital Malaysia (MyDIGITAL). Perusahaan PMKS teknologi tempatan berada di barisan hadapan dalam memacu pendigitalan perniagaan tradisional, automasi perisian SaaS, integrasi kecerdasan buatan (AI), dan sistem keselamatan data awan. Pertumbuhan sektor ini dipacu oleh keperluan syarikat korporat dan PMKS untuk mengurangkan kos overhed operasi melalui penyelesaian digital inovatif.`;
    marketTrends = [
      'Peningkatan mendadak permintaan terhadap perisian pengurusan perniagaan berasaskan awan (Cloud SaaS) dan automasi proses kerja.',
      'Pengintegrasian kecerdasan buatan (AI) dan automasi alur kerja (workflow automation) untuk meningkatkan produktiviti staf.',
      'Peralihan pelanggan korporat dan pengguna ke arah transaksi tanpa tunai (cashless), pembayaran digital bersepadu, dan perlindungan siber.'
    ];
    keyChallenges = [
      'Persaingan pasaran sengit daripada gergasi teknologi multinasional (MNC) yang mempunyai modal pemasaran besar.',
      'Kekurangan dan kos pengambilan bakat teknikal perisian (software engineers, data analysts, cloud specialists) yang tinggi.',
      'Kitaran jualan B2B yang panjang dan keperluan tempoh bukti konsep (Proof of Concept - POC) sebelum keputusan pembelian dibuat.'
    ];
    governmentPolicySupport = [
      'Geran Automasi & Pendigitalan Pintar PMKS oleh MDEC dengan pembiayaan padanan sehingga RM5,000.',
      'Insentif Status Malaysia Digital (MD Status) dengan fasilitasi insentif cukai dan kelulusan pas ekspatriat teknologi.',
      'Skim Pembiayaan Teknologi & Inovasi oleh agensi KUSKOP, MTDC, dan Skim Jaminan Pembiayaan Perniagaan (SJPP).'
    ];
    growthDrivers = [
      'Peluasan kontrak korporat dan perkongsian penyelesaian integrasi bersama syarikat telekomunikasi & GLC tempatan.',
      'Potensi penskalaan perisian rentas sempadan ke pasaran serantau ASEAN (Indonesia, Filipina, Vietnam).',
      'Pembangunan Harta Intelek (IP) proprietari yang menjana aliran hasil langganan berulang (recurring subscription ARR).'
    ];
  } else if (sector.includes('Pembuatan')) {
    sectorOverview = `Sektor Pembuatan di Malaysia menyumbang lebih 23% kepada KDNK negara dan menjadi pemangkin eksport utama negara. Dalam era Industri 4.0 (IR4.0), pengilang PMKS berhadapan dengan keperluan mendesak untuk beralih daripada proses intensif buruh kepada automasi pintar, pematuhan piawaian ESG antarabangsa, dan penjejakan kebolehkesanan bahan mentah secara masa nyata.`;
    marketTrends = [
      'Pelaksanaan sensor IoT dan automasi barisan pengeluaran bagi mengurangkan kebergantungan kepada pekerja asing.',
      'Penekanan ketat kepada pensijilan kualiti antarabangsa (ISO 9001, CE Mark, pensijilan keselamatan SIRIM).',
      'Permintaan rantaian bekalan hijau (Green Supply Chain) dan kecekapan penggunaan tenaga elektrik/bahan api.'
    ];
    keyChallenges = [
      'Kos pelaburan modal mesin teknologi tinggi (CAPEX) yang tinggi dan kenaikan kadar faedah pembiayaan komersial.',
      'Ketidaktentuan harga bahan mentah import berpunca daripada turun naik kadar pertukaran mata wang asing.',
      'Kenaikan kos gaji minimum dan caj levi pekerja asing mengikut dasar buruh terkini.'
    ];
    governmentPolicySupport = [
      'Program Peningkatan Keupayaan PKS (BAP) oleh SME Corp Malaysia dengan geran sepadan 50% bagi pembelian mesin.',
      'Skim Insentif Automasi Industri 4.0 (Industry4WRD) oleh MITI dan MIDA.',
      'Skim Jaminan Modal Kerja (WCS) oleh SJPP sehingga jaminan 80% pinjaman bank komersial.'
    ];
    growthDrivers = [
      'Peluasan kapasiti pengeluaran untuk membekalkan komponen kepada syarikat multinasional (MNC) dan korporat antarabangsa.',
      'Peluang eksport ke pasaran Perjanjian Perkongsian Ekonomi Komprehensif Serantau (RCEP) dan CPTPP.',
      'Pengurangan kos seunit (unit cost reduction) sebanyak 20% hasil daripada pengurangan kadar kecacatan (defect rate).'
    ];
  } else if (sector.includes('Makanan') || sector.includes('F&B')) {
    sectorOverview = `Sektor Makanan & Minuman (F&B) merupakan antara sektor paling dinamik di Malaysia dengan nilai pasaran melebihi RM60 bilion setahun. Malaysia memegang reputasi sebagai hab Halal global terkemuka, membuka peluang lumayan kepada pengeluar PMKS makanan untuk memasarkan produk ke pasaran tempatan dan antarabangsa.`;
    marketTrends = [
      'Peningkatan permintaan tinggi terhadap produk makanan sihat, rendah gula, organik, dan pembungkusan mesra alam.',
      'Integrasi platform penghantaran pantas, dapur awan (cloud kitchens), dan pemasaran kandungan video tular (TikTok/Reels).',
      'Piawaian kebersihan dan keselamatan makanan yang telus dengan pematuhan MeSTI dan pensijilan Halal JAKIM.'
    ];
    keyChallenges = [
      'Kenaikan mendadak harga bahan mentah asas (tepung, minyak masak, gula, produk tenusu, dan rempah ratus).',
      'Hayat simpanan (shelf life) produk yang terhad dan risiko pembaziran stok makanan mudah rosak jika tiada pengurusan FIFO yang cekap.',
      'Kadar pusing ganti pekerja barisan hadapan dan krew dapur yang tinggi.'
    ];
    governmentPolicySupport = [
      'Inisiatif Bantuan Pensijilan Halal dan MeSTI oleh Kementerian Kesihatan Malaysia (KKM) dan JAKIM.',
      'Program Pembangunan Eksport Makanan Halal oleh MATRADE dan Halal Development Corporation (HDC).',
      'Geran Padanan Promosi Makanan PMKS dan pembiayaan mudah oleh MARA serta TEKUN Nasional.'
    ];
    growthDrivers = [
      'Penembusan rangkaian pasar raya besar (hypermarket), kedai serbaneka premium, dan stesen minyak di seluruh negara.',
      'Peluasan pasaran eksport Halal ke Timur Tengah (UAE, Arab Saudi), Jepun, dan rantau ASEAN.',
      'Pembangunan produk sedia dimakan (Ready-to-Eat / RTE) dengan jangka hayat panjang melalui teknologi retort moden.'
    ];
  } else if (sector.includes('Peruncitan') || sector.includes('Pemborongan')) {
    sectorOverview = `Sektor Peruncitan dan Pemborongan di Malaysia kini berada di titik persimpangan transformasi omnisaluran (*omnichannel*), di mana sempadan antara kedai fizikal dan platform atas talian semakin kabur. Pelaksanaan mandat e-Invois LHDN menuntut para peruncit menaik taraf sistem POS dan perakaunan mereka ke arah automasi digital yang telus dan bersepadu.`;
    marketTrends = [
      'Peralihan strategi runcit kepada omnisaluran (kedai fizikal + TikTok Shop + Shopee/Lazada + laman web rasmi).',
      'Penggunaan perisian POS awan bersepadu dengan gerbang pembayaran QR DuitNow dan e-Dompet.',
      'Program kesetiaan digital (membership loyalty apps) untuk mengekalkan pelanggan berulang.'
    ];
    keyChallenges = [
      'Persaingan harga sengit daripada barangan import murah pasaran luar melalui platform e-dagang.',
      'Kenaikan kos sewa lot kedai runcit di pusat membeli-belah dan kawasan komersial bandar.',
      'Kos pematuhan sistem perisian e-Invois LHDN dan integrasi inventori multi-cawangan.'
    ];
    governmentPolicySupport = [
      'Geran Pendigitalan Runcit PMKS oleh MDEC dan Bank Simpanan Nasional (BSN).',
      'Skim Pembiayaan Usahawan Mikro & Peruncit oleh TEKUN dan Amanah Ikhtiar Malaysia (AIM).',
      'Kempen Beli Barangan Malaysia (KBBM) oleh Kementerian Perdagangan Dalam Negeri dan Kos Sara Hidup (KPDN).'
    ];
    growthDrivers = [
      'Peluasan model francais atau pelesenan jenama ke lokasi-lokasi strategik di seluruh negara.',
      'Pengurusan inventori automatik (Just-In-Time) yang mengurangkan modal terikat dalam stok lapuk sehingga 30%.',
      'Kerjasama eksklusif bersama pembekal tempatan untuk memperkenalkan barangan jenama persendirian (*house brand*).'
    ];
  } else if (sector.includes('Perkhidmatan') || sector.includes('Profesional')) {
    sectorOverview = `Sektor Perkhidmatan & Profesional di Malaysia menyumbang lebih 55% kepada aktiviti perniagaan PMKS negara. Pengamal perkhidmatan kini bergerak pantas ke arah automasi aliran kerja, pengurusan perhubungan pelanggan (CRM), dan pematuhan instrumen percukaian digital serta e-Invois LHDN bagi memperkukuh tadbir urus firma.`;
    marketTrends = [
      'Penggunaan sistem pengurusan projek awan dan instrumen kolaborasi maya untuk menyampaikan tugasan pelanggan.',
      'Peralihan kepada model langganan khidmat berulang (retainer contracts) berbanding perkhidmatan berasaskan ad-hoc.',
      'Peningkatan kesedaran pelanggan terhadap jaminan tahap kualiti perkhidmatan (Service Level Agreement - SLA).'
    ];
    keyChallenges = [
      'Kekangan aliran tunai akibat kelewatan bayaran invois klien melepasi tempoh kredit 60 hari.',
      'Pengekalan bakat profesional berikutan tawaran gaji yang lebih kompetitif oleh syarikat antarabangsa.',
      'Kebergantungan berlebihan kepada pengasas firma untuk menutup rundingan jualan utama.'
    ];
    governmentPolicySupport = [
      'Program Peningkatan Perkhidmatan PMKS oleh SME Corp Malaysia.',
      'Geran Pembiayaan Digital & Latihan Profesional oleh HRD Corp dan TalentCorp.',
      'Skim Jaminan Pembiayaan Sektor Perkhidmatan oleh SJPP.'
    ];
    growthDrivers = [
      'Pakej perkhidmatan modular yang mudah diskalakan kepada pasaran B2B seluruh negara.',
      'Pembangunan repositori modul SOP berulang yang memendekkan tempoh onboarding staf baharu sebanyak 50%.',
      'Pemeteraian perjanjian perkongsian strategik dengan entiti korporat dan agensi kerajaan.'
    ];
  } else if (sector.includes('Pertanian') || sector.includes('Asas Tani')) {
    sectorOverview = `Sektor Pertanian & Asas Tani di Malaysia merupakan tunjang sekuriti makanan negara yang diberi penekanan khas dalam Rancangan Malaysia Ke-12 (RMK-12). Transformasi agromakanan kini menekankan penggunaan teknologi pertanian tepat (Precision Agriculture) dan pensijilan kualiti myGAP bagi melonjakkan daya saing pengeluar tempatan.`;
    marketTrends = [
      'Penggunaan teknologi sistem fertigasi pintar dan sensor kelembapan tanah berasaskan IoT.',
      'Peningkatan permintaan pengguna terhadap hasil pertanian segar bebas racun dan pensijilan organik/myGAP.',
      'Pemasaran terus daripada ladang ke pengguna (Farm-to-Table) melalui platform digital.'
    ];
    keyChallenges = [
      'Kenaikan mendadak harga input pertanian termasuk baja import, racun, dan makanan ternakan.',
      'Kesan perubahan cuaca ekstrem dan risiko kerosakan hasil tuaian pasca-penuaian.',
      'Kekurangan tenaga kerja mahir dan proses pemprosesan asas tani yang masih manual.'
    ];
    governmentPolicySupport = [
      'Dasar Agromakanan Negara 2021-2030 (DAN 2.0) oleh Kementerian Pertanian dan Keterjaminan Makanan (KPKM).',
      'Kemudahan Dana Agromakanan (ADF) dan skim pembiayaan mikro oleh Agrobank.',
      'Program Pemodenan Rantaian Makanan PMKS oleh FAMA dan MARDI.'
    ];
    growthDrivers = [
      'Pembangunan produk hiliran asas tani dengan pembungkusan moden dan jangka hayat panjang.',
      'Peluasan kontrak pembekalan terus kepada rangkaian pasar raya besar dan pengeluar makanan F&B korporat.',
      'Pensijilan amalan pertanian baik (myGAP & Halal) yang melayakkan produk menembusi pasaran eksport serantau.'
    ];
  } else if (sector.includes('Pembinaan') || sector.includes('Kejuruteraan')) {
    sectorOverview = `Sektor Pembinaan & Kejuruteraan di Malaysia memacu pembangunan infrastruktur dan pembandaran negara. Kontraktor PMKS kini dikehendaki mematuhi piawaian pensijilan CIDB, amalan keselamatan tapak kerja (DOSH/OSHA), serta mengadaptasi teknologi Pemodelan Maklumat Bangunan (BIM) dan Kaedah Pembinaan Industri (IBS).`;
    marketTrends = [
      'Peralihan tender projek kepada keperluan penggunaan komponen pasang siap (IBS) dan amalan binaan hijau.',
      'Penggunaan perisian penjejakan kemajuan projek dan pengurusan bajet subkontraktor secara masa nyata.',
      'Penekanan ketat kepada pensijilan sistem pengurusan kualiti ISO 9001 dan pensijilan CIDB SCORE.'
    ];
    keyChallenges = [
      'Kenaikan harga bahan binaan asas (besi, simen, pasir) dan ketidaktentuan margin keuntungan kontrak tetap.',
      'Kelewatan pengeluaran bayaran kemajuan interim (progress payment claims) daripada kontraktor utama.',
      'Isu kekurangan pekerja mahir tapak dan penguatkuasaan ketat peraturan penginapan pekerja (Akta 446).'
    ];
    governmentPolicySupport = [
      'Skim Pembiayaan Kontraktor PMKS oleh CIDB dan SME Bank.',
      'Inisiatif Pensijilan SCORE CIDB bagi melayakkan kontraktor menyertai tender kerajaan berimpak tinggi.',
      'Skim Jaminan Kontrak Kerja Kerajaan oleh Syarikat Jaminan Pembiayaan Perniagaan (SJPP).'
    ];
    growthDrivers = [
      'Penaikan gred pendaftaran CIDB (G1 hingga G7) untuk membida kontrak berskala lebih tinggi.',
      'Penerimagunaan teknologi IBS yang mempercepatkan tempoh penyiapan projek sehingga 30%.',
      'Perkongsian usaha sama (joint-venture) dengan pemaju hartanah dan syarikat infrastruktur GLC.'
    ];
  }

  return {
    sectorOverview,
    stageAnalysis,
    yearsInOperation: years,
    source: 'ml-rules',
    generatedAt: new Date().toISOString(),
    marketTrends,
    keyChallenges,
    governmentPolicySupport,
    growthDrivers
  };
}

function generateElementDeepAnalyses(
  scores: Record<MofassCategoryId, CategoryScoreResult> | undefined,
  answers: Record<string, number>
): Record<MofassCategoryId, ElementDeepAnalysis> {
  const result: Record<MofassCategoryId, ElementDeepAnalysis> = {} as any;

  const safeScores = scores || ({} as any);
  const mScore = safeScores.M || { percentage: 70, status: 'Memuaskan' };
  const oScore = safeScores.O || { percentage: 70, status: 'Memuaskan' };
  const fScore = safeScores.F || { percentage: 70, status: 'Memuaskan' };
  const aScore = safeScores.A || { percentage: 70, status: 'Memuaskan' };
  const sSalesScore = safeScores.S_SALES || { percentage: 70, status: 'Memuaskan' };
  const sSysScore = safeScores.S_SYSTEM || { percentage: 70, status: 'Memuaskan' };

  // 1. Marketing
  result.M = {
    categoryId: 'M',
    narrativeDiagnosis: `Dimensi Pemasaran mencatatkan skor ${mScore.percentage}% (${mScore.status}). Syarikat menunjukkan kesedaran terhadap kepentingan kepuasan pelanggan, namun strategi pemasaran berstruktur dan penjenamaan berdaftar masih memerlukan pengukuhan bagi menjamin pengekalan pelanggan yang konsisten.`,
    rootCauses: [
      'Ketiadaan belanjawan pemasaran tahunan yang diperuntukkan secara tetap (kebanyakannya bersifat ad-hoc).',
      'Pangkalan data pelanggan (CRM) belum diintegrasikan dengan sistem automasi susulan aduan dan ganjaran kesetiaan.',
      'Aset cap dagangan (Trademark) atau identiti jenama belum didaftarkan sepenuhnya di MyIPO.'
    ],
    strategicPrescription: 'Bina pelan pemasaran omnisaluran suku tahunan, gunakan perisian CRM percuma/mampu milik, dan daftar perlindungan harta intelek jenama.'
  };

  // 2. Operation
  result.O = {
    categoryId: 'O',
    narrativeDiagnosis: `Dimensi Operasi mencatatkan skor ${oScore.percentage}% (${oScore.status}). Aliran kerja harian berjalan secara amali, namun kebergantungan kepada arahan lisan berbanding Manual Prosedur Piawaian Pengendalian (SOP) bertulis mendedahkan syarikat kepada ralat kualiti dan pembaziran bahan.`,
    rootCauses: [
      'Dokumentasi SOP operasi belum lengkap atau tidak disemak secara berkala bersama staf barisan hadapan.',
      'Sistem kawalan stok dan inventori masih bergantung kepada semakan manual tanpa amalan FIFO/JIT ketat.',
      'Ketiadaan pelan kontingensi kesinambungan perniagaan (BCP) sekiranya berlaku kecemasan luar jangka.'
    ],
    strategicPrescription: 'Dokumenkan 5 SOP teras dalam tempoh 30 hari, laksanakan senarai semak kawalan kualiti (QC) berpusat, dan rancang perolehan persijilan industri (cth: MeSTI / Halal / ISO).'
  };

  // 3. Finance
  result.F = {
    categoryId: 'F',
    narrativeDiagnosis: `Dimensi Kewangan mencatatkan skor ${fScore.percentage}% (${fScore.status}). Kedudukan aliran tunai perlu dipantau secara teliti bagi memastikan liabiliti semasa tidak melebihi rizab operasi. Ketepatan rekod simpan kira digital adalah syarat wajib untuk kelayakan pembiayaan institusi kewangan.`,
    rootCauses: [
      'Penuaan hutang (aging accounts receivable) melebihi 45 hari tanpa tindakan penguatkuasaan terma kredit.',
      'Penyata kewangan beraudit tahunan belum dikemaskini tepat pada masanya untuk audit SSM dan percukaian LHDN.',
      'Rizab kecemasan tunai operasi kurang daripada sasaran minimum 3 bulan perbelanjaan tetap.'
    ],
    strategicPrescription: 'Pindahkan simpan kira ke perisian perakaunan awan patuh e-Invois LHDN, laksanakan polisi kredit ketat (30 hari), dan bina rizab kecemasan secara berjadual.'
  };

  // 4. Administration / HR
  result.A = {
    categoryId: 'A',
    narrativeDiagnosis: `Dimensi Pentadbiran & Sumber Manusia mencatatkan skor ${aScore.percentage}% (${aScore.status}). Struktur organisasi wujud namun pembahagian skop kerja bertulis (Job Description) dan latihan kemahiran berterusan perlu dimantapkan demi mengekalkan bakat berkualiti.`,
    rootCauses: [
      'Ketiadaan kontrak huraian kerja (JD) yang memautkan sasaran individu dengan petunjuk prestasi utama (KPI).',
      'Pelaburan dalam program latihan modal insan masih terhad, menyebabkan jurang kecekapan staf teknikal.',
      'Skim ganjaran atau insentif belum dikaitkan secara langsung dengan pencapaian keuntungan bersih syarikat.'
    ],
    strategicPrescription: 'Gunakan dana latihan HRD Corp (SBL-Khas) untuk melatih pekerja, kemaskini carta organisasi dan wujudkan skim bonus prestasi berasaskan merit.'
  };

  // 5. Sales
  result.S_SALES = {
    categoryId: 'S_SALES',
    narrativeDiagnosis: `Dimensi Jualan mencatatkan skor ${sSalesScore.percentage}% (${sSalesScore.status}). Syarikat mempunyai aliran jualan asas, namun daya saing produk dan saluran jualan korporat B2B atau pasaran luar masih belum dimaksimumkan sepenuhnya.`,
    rootCauses: [
      'Risiko penumpuan portfolio pelanggan (kebergantungan berlebihan kepada segelintir pelanggan utama).',
      'Ketiadaan corong jualan (sales pipeline) yang diuruskan secara saintifik dengan sasaran penukaran prospek.',
      'Pakej nilai tambah belum dikemas kini selaras dengan sentimen harga pasaran kompetitif.'
    ],
    strategicPrescription: 'Pelbagaikan portfolio pelanggan melalui pendaftaran tender vendor korporat/GLC, reka bentuk pakej jualan berulang (recurring contracts), dan teroka pasaran eksport menerusi MATRADE.'
  };

  // 6. System / IT
  result.S_SYSTEM = {
    categoryId: 'S_SYSTEM',
    narrativeDiagnosis: `Dimensi Sistem & Teknologi Maklumat mencatatkan skor ${sSysScore.percentage}% (${sSysScore.status}). Tahap pendigitalan perniagaan masih berada pada fasa pemula dan memerlukan penaiktarafan kepada perisian berpusat yang selamat dan berskala.`,
    rootCauses: [
      'Proses pemprosesan data dan transaksi masih terpisah (siloed) antara bahagian operasi, akaun, dan jualan.',
      'Ketiadaan sandaran awan automatik (cloud backup) yang menjamin keselamatan rekod perniagaan daripada serangan siber.',
      'Peruntukan belanjawan teknologi maklumat (IT Capex/Opex) belum dimasukkan ke dalam pelan belanjawan tahunan.'
    ],
    strategicPrescription: 'Mohon Geran Digital PMKS MDEC (RM5,000 padanan), integrasikan sistem POS awan dan perakaunan, serta laksanakan protokol sandaran data automatik.'
  };

  return result;
}

function generateStrategicBlueprint(
  company: CompanyProfile,
  scores: Record<MofassCategoryId, CategoryScoreResult>,
  overallPercentage: number
): StrategicBlueprint {
  const vision = `Menjadikan ${company.companyName} sebuah perusahaan berdaya tahan tinggi, dipacu kecekapan proses bersistem, dan bersedia untuk penskalaan hasil berganda dalam tempoh 12 hingga 24 bulan ke hadapan.`;

  const corePillars = [
    {
      title: 'Teras 1: Kecekapan Operasi & Dokumentasi SOP Terpiawai',
      focus: 'Menghapuskan ralat kualiti, mengurangkan pembaziran bahan mentah, dan mematuhi piawaian pensijilan industri.',
      expectedOutcome: 'Pengurangan ralat operasi sebanyak 25% dan kelulusan pensijilan industri dalam tempoh 6 bulan.'
    },
    {
      title: 'Teras 2: Ketelusan Kewangan & Kawalan Aliran Tunai',
      focus: 'Pelaksanaan sistem perakaunan awan patuh e-Invois LHDN, kawalan kredit 30 hari, dan pembinaan rizab tunai kecemasan.',
      expectedOutcome: 'Peningkatan kecairan tunai operasi 3 bulan dan penjimatan kos perakaunan sebanyak 15%.'
    },
    {
      title: 'Teras 3: Transformasi Digital & Automasi Sistem Berpusat',
      focus: 'Mengintegrasikan perisian jualan (POS/CRM), pengurusan inventori, dan sandaran awan selamat.',
      expectedOutcome: 'Penjimatan sekurang-kurangnya 12 jam masa staf setiap minggu melalui automasi kerja rutin.'
    },
    {
      title: 'Teras 4: Penskalaan Pasaran & Pelbagaian Saluran Jualan',
      focus: 'Mempelbagaikan portfolio pelanggan, meneroka kontrak B2B/GLC, dan memanfaatkan program eksport MATRADE.',
      expectedOutcome: 'Lonjakan hasil tahunan sebanyak 20% - 35% dan pengurangan risiko penumpuan pelanggan.'
    }
  ];

  const kpis: StrategicKPI[] = [
    {
      metric: 'Pertumbuhan Hasil Jualan Tahunan (Revenue Growth)',
      baseline: `${company.annualTurnover}`,
      target12Months: '+25% daripada asas semasa',
      category: 'S_SALES',
      measurementFrequency: 'Bulanan'
    },
    {
      metric: 'Margin Keuntungan Bersih (Net Profit Margin)',
      baseline: '8% - 12%',
      target12Months: '> 18% konsisten',
      category: 'F',
      measurementFrequency: 'Suku Tahunan'
    },
    {
      metric: 'Kadar Pusing Ganti Kutipan Penghutang (DSO)',
      baseline: '55 hari',
      target12Months: '< 30 hari',
      category: 'F',
      measurementFrequency: 'Bulanan'
    },
    {
      metric: 'Kadar Ralat / Pembaziran Operasi (Defect Rate)',
      baseline: '5% - 8%',
      target12Months: '< 1.5%',
      category: 'O',
      measurementFrequency: 'Mingguan'
    },
    {
      metric: 'Skor Kepuasan Pelanggan (CSAT / NPS)',
      baseline: '72%',
      target12Months: '> 90%',
      category: 'M',
      measurementFrequency: 'Bulanan'
    },
    {
      metric: 'Tahap Pendigitalan Proses Teras (Digital Adoption)',
      baseline: `${scores.S_SYSTEM.percentage}%`,
      target12Months: '> 85%',
      category: 'S_SYSTEM',
      measurementFrequency: 'Suku Tahunan'
    }
  ];

  const actionPlan: DetailedActionPlan[] = [
    {
      id: 'act-1',
      initiative: 'Pelaksanaan Audit Dalaman & Dokumentasi 5 SOP Teras',
      category: 'Operasi',
      phase: 'Fasa 1 (30 Hari - Quick Wins)',
      specificActions: [
        'Petakan aliran kerja harian dari penerimaan pesanan sehingga penghantaran kepada pelanggan.',
        'Sediakan dokumen SOP ringkas berserta senarai semak kawalan kualiti (QC checklist).',
        'Lantik ketua operasi untuk memastikan pematuhan SOP di kalangan kakitangan.'
      ],
      pic: 'Pengurus Operasi / Ketua Penyelia',
      resourcesNeeded: 'Templat SOP Notion / Google Docs (Kos Rendah)',
      kpiTarget: '100% staf terlatih dan menandatangani pematuhan SOP',
      riskLevel: 'Rendah'
    },
    {
      id: 'act-2',
      initiative: 'Migrasi ke Perisian Perakaunan Awan & Penguatkuasaan Terma Kredit',
      category: 'Kewangan',
      phase: 'Fasa 1 (30 Hari - Quick Wins)',
      specificActions: [
        'Daftar perisian perakaunan digital patuh e-Invois LHDN (cth. Bukku, SQL Account, Xero).',
        'Hantar surat pekeliling penetapan terma kredit 30 hari kepada semua pelanggan belum bayar.',
        'Wujudkan tabung rizab kecemasan syarikat dengan memindahkan 10% keuntungan bulanan.'
      ],
      pic: 'Pengurus Kewangan / Akauntan',
      resourcesNeeded: 'Langganan perisian perakaunan awan (~RM80 - RM150/bulan)',
      kpiTarget: 'Laporan aliran tunai dan penuaan hutang dijana secara automatik',
      riskLevel: 'Sederhana'
    },
    {
      id: 'act-3',
      initiative: 'Integrasi Pangkalan Data Pelanggan (CRM) & Pemasaran Omnisaluran',
      category: 'Pemasaran & Jualan',
      phase: 'Fasa 2 (60 Hari - Penstrukturan)',
      specificActions: [
        'Kumpulkan semua nombor dan emel pelanggan ke dalam sistem CRM berpusat.',
        'Lancarkan kempen pemulihan pelanggan dorman dengan tawaran diskaun istimewa.',
        'Bina saluran perkongsian maklum balas berjadual selepas jualan melalui WhatsApp API.'
      ],
      pic: 'Pegawai Pemasaran & Khidmat Pelanggan',
      resourcesNeeded: 'WhatsApp Business API & Alatan CRM (~RM100/bulan)',
      kpiTarget: 'Kenaikan pembelian berulang sebanyak 20%',
      riskLevel: 'Rendah'
    },
    {
      id: 'act-4',
      initiative: 'Penyusunan Kontrak Kerja (JD) & Pendaftaran Skim HRD Corp',
      category: 'Pentadbiran & HR',
      phase: 'Fasa 2 (60 Hari - Penstrukturan)',
      specificActions: [
        'Kaji semula kontrak kerja selaras dengan pindaan Akta Kerja 1955.',
        'Sediakan huraian tugas bertulis berserta metrik KPI individu bagi setiap pekerja.',
        'Tuntut dana latihan HRD Corp bagi kursus peningkatan kemahiran teknikal.'
      ],
      pic: 'Pegawai Sumber Manusia / Pentadbiran',
      resourcesNeeded: 'Caruman HRD Corp sedia ada',
      kpiTarget: 'Penurunan kadar pusing ganti pekerja di bawah 5% setahun',
      riskLevel: 'Rendah'
    },
    {
      id: 'act-5',
      initiative: 'Permohonan Pensijilan Industri & Kelayakan Vendor Korporat/GLC',
      category: 'Jualan & Kualiti',
      phase: 'Fasa 3 (90 Hari - Penskalaan)',
      specificActions: [
        'Mohon persijilan relevan seperti MeSTI / Halal JAKIM / ISO 9001.',
        'Daftar profil syarikat di portal perolehan kerajaan (e-Perolehan) dan GLC.',
        'Sertai sesi padanan perniagaan (business matching) anjuran agensi kerajaan.'
      ],
      pic: 'Pengarah Urusan / Pegawai Pembangunan Perniagaan',
      resourcesNeeded: 'Kos yuran pensijilan (~RM3,000 - RM8,000 dengan geran sepadan)',
      kpiTarget: 'Menerima sekurang-kurangnya 2 kontrak B2B bernilai tinggi',
      riskLevel: 'Sederhana'
    },
    {
      id: 'act-6',
      initiative: 'Automasi Penuh Rantaian Bekalan & Persediaan Eksport Rentas Sempadan',
      category: 'Sistem & Strategik',
      phase: 'Fasa 4 (180 Hari - Transformasi)',
      specificActions: [
        'Lengkapkan automasi integrasi inventori dengan saluran jualan fizikal dan e-dagang.',
        'Daftar dengan MATRADE dan mohon Market Development Grant (MDG) untuk pasaran serantau.',
        'Dapatkan penilaian audit berkala penarafan bintang SME Corp SCORE untuk akses pembiayaan institusi.'
      ],
      pic: 'Pengarah Urusan & Ketua IT',
      resourcesNeeded: 'Geran MDEC & Geran MDG MATRADE',
      kpiTarget: 'Penarafan 4 Bintang SCORE dan penembusan pasaran antarabangsa',
      riskLevel: 'Sederhana'
    }
  ];

  return {
    transformationVision: vision,
    corePillars,
    kpis,
    actionPlan,
    estimatedBudgetROI: {
      estimatedInvestment: 'RM 12,000 - RM 25,000 (sebahagian besar boleh ditampung melalui geran padanan)',
      projectedPaybackPeriod: '4 hingga 7 bulan',
      projectedGrowthRate: '25% - 40% peningkatan kecekapan & hasil tahunan'
    }
  };
}

function generateExecutiveSummary(
  company: CompanyProfile,
  overallScore: number,
  maturityTitle: string,
  lowestCat: CategoryScoreResult,
  highestCat: CategoryScoreResult
): string {
  return `Berdasarkan analisis diagnostik algoritma MOFASS untuk syarikat ${company.companyName} dalam sektor ${company.sector}, tahap kompetensi keseluruhan perniagaan anda berada pada ${overallScore}% (${maturityTitle}). Kekuatan terunggul perniagaan anda terbukti dalam dimensi ${highestCat.categoryName} (${highestCat.percentage}%), yang menunjukkan asas perniagaan yang kukuh dalam aspek tersebut. Walau bagaimanapun, titik kesesakan (bottleneck) kritikal yang paling mengehadkan skala pertumbuhan anda terletak pada dimensi ${lowestCat.categoryName} (${lowestCat.percentage}%). Intervensi berstruktur dalam tempoh 90 hari akan datang dijangka mampu meningkatkan kecekapan operasi dan memacu margin keuntungan syarikat sehingga 18% - 30%.`;
}

function generateGrowthRoadmap(
  scores: Record<MofassCategoryId, CategoryScoreResult>,
  company: CompanyProfile
): ActionPlanItem[] {
  const items: ActionPlanItem[] = [];

  // Mkt
  if (scores.M.percentage < 70) {
    items.push({
      id: 'plan-mkt-1',
      title: 'Pelaksanaan Sistem CRM & Automasi Susulan Pelanggan',
      category: 'Marketing',
      timeframe: '30 Hari (Cepat)',
      priority: 'Kritikal',
      impactArea: 'Meningkatkan pengekalan pelanggan (retention) dan jualan berulang sehingga 25%.',
      actionDetails: [
        'Wujudkan pangkalan data pelanggan berpusat menggunakan alatan CRM awan (HubSpot Free / WhatsApp Business API).',
        'Latih staf khidmat pelanggan untuk membalas aduan dan maklum balas dalam tempoh SLA < 1 jam.',
        'Mulakan tinjauan kepuasan ringkas bulanan (CSAT) untuk mengesan kelemahan produk/servis.'
      ],
      suggestedToolsOrAgencies: ['WhatsApp Business', 'HubSpot CRM', 'SME Corp BAP']
    });
  }

  // Ops
  if (scores.O.percentage < 70) {
    items.push({
      id: 'plan-ops-1',
      title: 'Pendokumentasian SOP Operasi & Kawalan Kualiti (QC)',
      category: 'Operation',
      timeframe: '30 Hari (Cepat)',
      priority: 'Kritikal',
      impactArea: 'Mengurangkan ralat kesilapan staf dan pembaziran bahan sehingga 30%.',
      actionDetails: [
        'Dokumenkan 5 proses kerja harian terpenting dalam bentuk Standard Operating Procedure (SOP) bergambar yang ringkas.',
        'Lantik seorang ketua penyelia kualiti (QC) untuk memeriksa produk atau serahan servis sebelum diserah kepada pelanggan.',
        'Wujudkan log pengurusan inventori secara FIFO untuk elak bahan terperap atau kehabisan stok mendadak.'
      ],
      suggestedToolsOrAgencies: ['Notion SOP', 'Kaizen Checklist', 'Latihan HRD Corp']
    });
  }

  // Fin
  if (scores.F.percentage < 70) {
    items.push({
      id: 'plan-fin-1',
      title: 'Pengurusan Aliran Tunai & Penstrukturan Akaun Berkanun',
      category: 'Finance',
      timeframe: '60 Hari (Sederhana)',
      priority: 'Kritikal',
      impactArea: 'Melindungi rizab operasi sekurang-kurangnya 3 bulan dan melancarkan kelayakan pembiayaan bank.',
      actionDetails: [
        'Tukar simpan kira manual/kertas kepada perisian perakaunan digital patuh LHDN e-Invois (cth. Bukku / SQL Account).',
        'Tetapkan polisi terma kredit penghutang maksima 30 hari dengan diskaun bayaran awal.',
        'Sediakan unjuran aliran tunai (cash flow forecast) mingguan bagi menjamin keupayaan membayar gaji dan sewa.'
      ],
      suggestedToolsOrAgencies: ['Bukku Accounting', 'SQL Account', 'Geran MDEC']
    });
  }

  // Admin / HR
  if (scores.A.percentage < 70) {
    items.push({
      id: 'plan-adm-1',
      title: 'Penjelasan Skop Kerja (Job Description) & Skim Insentif Prestasi',
      category: 'Administration',
      timeframe: '60 Hari (Sederhana)',
      priority: 'Tinggi',
      impactArea: 'Mengurangkan kadar pusing ganti pekerja (turnover) dan meningkatkan motivasi kakitangan.',
      actionDetails: [
        'Semak semula kontrak kerja, pastikan caruman KWSP, PERKESO, EIS dan pendaftaran HRD Corp dipatuhi sepenuhnya.',
        'Sediakan huraian tugas bertulis berserta 3 KPI jelas bagi setiap jawatan penting.',
        'Strukturkan skim komisen atau bonus berasaskan sasaran keuntungan syarikat.'
      ],
      suggestedToolsOrAgencies: ['Akta Kerja 1955 Checklist', 'HRD Corp SBL-Khas']
    });
  }

  // Sales
  if (scores.S_SALES.percentage < 75) {
    items.push({
      id: 'plan-sls-1',
      title: 'Peluasan Saluran Jualan B2B & Tawaran Pakej Nilai Tambah',
      category: 'Sales',
      timeframe: '90 Hari (Strategik)',
      priority: 'Tinggi',
      impactArea: 'Mempelbagaikan portfolio hasil dan mengelakkan risiko pergantungan pelanggan tunggal.',
      actionDetails: [
        'Rangka profil syarikat (company profile) profesional untuk menyertai tender atau pendaftaran vendor GLC/MNC.',
        'Kaji semula struktur harga dan perkenalkan pakej langganan atau pembelian ulangan (recurring sales).',
        'Mohon pensijilan berkaitan (Halal / MeSTI / ISO) untuk membuka pintu pasaran pasar raya besar dan eksport.'
      ],
      suggestedToolsOrAgencies: ['MATRADE MDG', 'SME Corp SCORE', 'Dewan Perniagaan']
    });
  }

  // IT & System
  if (scores.S_SYSTEM.percentage < 75) {
    items.push({
      id: 'plan-sys-1',
      title: 'Automasi Digital Bersepadu & Infrastruktur Keselamatan Cloud',
      category: 'System',
      timeframe: '90 Hari (Strategik)',
      priority: 'Tinggi',
      impactArea: 'Menjimatkan masa pengurusan harian sekurang-kurangnya 15 jam seminggu dan menjamin keselamatan data.',
      actionDetails: [
        'Pindahkan dokumen kerja penting dan sandaran data ke Google Workspace / Microsoft 365 Cloud yang selamat.',
        'Integrasikan sistem Point-of-Sale (POS) atau e-Dagang dengan inventori dan gerbang pembayaran automatik.',
        'Gunakan geran digital PMKS RM5,000 daripada MDEC/BSN untuk membiayai langganan alatan perisian.'
      ],
      suggestedToolsOrAgencies: ['MDEC Digital Grant', 'Google Workspace', 'Sistem POS Awan']
    });
  }

  // If already high score across all, provide high-level scaling plan
  if (items.length < 3) {
    items.push({
      id: 'plan-scale-1',
      title: 'Penskalaan Serantau & Pensijilan Eksport Antarabangsa',
      category: 'Strategik',
      timeframe: '90 Hari (Strategik)',
      priority: 'Sederhana',
      impactArea: 'Membuka pasaran luar negara (ASEAN/Timur Tengah) dengan unjuran lonjakan hasil 200%.',
      actionDetails: [
        'Daftar dengan MATRADE dan sertai misi perdagangan luar negara melalui geran Market Development Grant (MDG).',
        'Daftar perlindungan Harta Intelek (IP/Paten/Cap Dagang) di pasaran serantau melalui MyIPO.',
        'Kaji peluang francais atau pembukaan cawangan satelit di bandar-bandar utama.'
      ],
      suggestedToolsOrAgencies: ['MATRADE MDG', 'MyIPO', 'Perbadanan Nasional Berhad (PNS)']
    });
  }

  return items;
}
