import { MofassCategory, MofassCategoryId } from '../types';

export const MOFASS_CATEGORIES: MofassCategory[] = [
  {
    id: 'M',
    code: 'MKT',
    letter: 'M',
    name: 'Marketing (Pemasaran)',
    shortName: 'Pemasaran',
    description: 'Strategi penjenamaan, saluran promosi, kepuasan pelanggan, dan CRM untuk membina permintaan mampan.',
    badgeColor: 'bg-rose-500 text-white',
    iconName: 'Megaphone',
    questions: [
      {
        id: 'M1',
        categoryId: 'M',
        number: 1,
        text: 'Syarikat kami mempunyai pelan dan strategi pemasaran yang jelas serta dikemaskini secara berkala.',
        guidance: 'Pelan bertulis merangkumi sasaran pelanggan, proposisi nilai, dan bajet pemasaran tahunan.'
      },
      {
        id: 'M2',
        categoryId: 'M',
        number: 2,
        text: 'Syarikat kami menggunakan pelbagai saluran promosi (seperti media digital, media cetak, atau perangkaian) untuk menjangkau pasaran sasaran.',
        guidance: 'Kombinasi pemasaran omnisaluran seperti media sosial, carian Google, kempen e-mel, dan rujukan.'
      },
      {
        id: 'M3',
        categoryId: 'M',
        number: 3,
        text: 'Syarikat kami aktif menyertai pameran dagangan, kempen promosi, atau program jaringan perniagaan.',
        guidance: 'Penglibatan dalam ekspo industri (cth. MIHAS, MATRADE, pameran persatuan) atau komuniti usahawan.'
      },
      {
        id: 'M4',
        categoryId: 'M',
        number: 4,
        text: 'Syarikat kami mempunyai peruntukan sumber atau krew khas bagi menguruskan Pengurusan Hubungan Pelanggan (CRM).',
        guidance: 'Pasukan atau kakitangan yang mengendalikan interaksi, pangkalan data dan susulan prospek.'
      },
      {
        id: 'M5',
        categoryId: 'M',
        number: 5,
        text: 'Kepuasan pelanggan dijadikan keutamaan tertinggi dalam setiap aspek perniagaan kami.',
        guidance: 'Budaya berorientasikan pelanggan diterapkan dari peringkat pengurusan hingga barisan hadapan.'
      },
      {
        id: 'M6',
        categoryId: 'M',
        number: 6,
        text: 'Syarikat kami mengumpul maklum balas pelanggan secara tersusun dan berkala.',
        guidance: 'Tinjauan berkala, borang penilaian kualiti perkhidmatan, atau kajian kepuasan pelanggan (CSAT/NPS).'
      },
      {
        id: 'M7',
        categoryId: 'M',
        number: 7,
        text: 'Maklum balas pelanggan digunakan secara aktif untuk menambah baik produk, perkhidmatan, dan strategi tawaran kami.',
        guidance: 'Kitaran maklum balas diterjemahkan ke dalam R&D produk, penambahbaikan menu, atau pakej perkhidmatan.'
      },
      {
        id: 'M8',
        categoryId: 'M',
        number: 8,
        text: 'Syarikat kami memberi maklum balas dan tindakan susulan terhadap aduan atau maklum balas pelanggan dalam tempoh yang pantas.',
        guidance: 'SLA tindak balas aduan yang pantas (cth: kurang daripada 24 jam) dengan resolusi profesional.'
      },
      {
        id: 'M9',
        categoryId: 'M',
        number: 9,
        text: 'Syarikat kami mempunyai program atau inisiatif khas untuk mengekalkan kesetiaan pelanggan sedia ada.',
        guidance: 'Program ganjaran (loyalty program), promosi VIP, diskaun ulang tahun, atau tawaran istimewa pelanggan berulang.'
      },
      {
        id: 'M10',
        categoryId: 'M',
        number: 10,
        text: 'Jenama atau imej perniagaan kami didaftarkan secara rasmi dan mempunyai keunikan tersendiri di pasaran.',
        guidance: 'Cap dagangan (Trademark MyIPO), identiti jenama konsisten, dan pembezaan yang jelas berbanding pesaing.'
      }
    ]
  },
  {
    id: 'O',
    code: 'OPS',
    letter: 'O',
    name: 'Operation (Operasi)',
    shortName: 'Operasi',
    description: 'Kecekapan aliran kerja harian, kawalan kualiti, pematuhan SOP, dan pengurusan rantaian bekalan.',
    badgeColor: 'bg-amber-500 text-white',
    iconName: 'Cog',
    questions: [
      {
        id: 'O1',
        categoryId: 'O',
        number: 1,
        text: 'Syarikat kami mempunyai aliran kerja atau proses operasi harian yang teratur dan cekap.',
        guidance: 'Aliran penghantaran perkhidmatan atau pembuatan yang lancar tanpa kekangan (bottlenecks).'
      },
      {
        id: 'O2',
        categoryId: 'O',
        number: 2,
        text: 'Syarikat kami mempunyai dan mematuhi Manual Prosedur Piawaian Pengendalian (SOP) secara menyeluruh.',
        guidance: 'Dokumentasi langkah demi langkah bertulis yang difahami dan dirujuk oleh semua staf.'
      },
      {
        id: 'O3',
        categoryId: 'O',
        number: 3,
        text: 'Syarikat kami sentiasa memastikan tahap kualiti output (produk/perkhidmatan) kekal tinggi dan meminimumkan ralat/kesilapan.',
        guidance: 'Kadar kecacatan (defect rate) atau ralat servis yang sangat rendah melalui kawalan kualiti (QC).'
      },
      {
        id: 'O4',
        categoryId: 'O',
        number: 4,
        text: 'Syarikat kami mengamalkan aktiviti penambahbaikan kualiti yang berterusan dalam operasi harian.',
        guidance: 'Amalan Kaizen / Lean, semakan mingguan untuk mengurangkan pembaziran masa dan sumber.'
      },
      {
        id: 'O5',
        categoryId: 'O',
        number: 5,
        text: 'Operasi kami mematuhi piawaian, persijilan, atau pendaftaran kualiti yang diiktiraf dalam industri.',
        guidance: 'Persijilan seperti Halal JAKIM, MeSTI, GMP, HACCP, ISO 9001 atau piawaian industri berkaitan.'
      },
      {
        id: 'O6',
        categoryId: 'O',
        number: 6,
        text: 'Syarikat kami mempunyai sistem kawalan dan amalan pengurusan risiko operasi yang berkesan.',
        guidance: 'Pengenalpastian risiko operasi, keselamatan tempat kerja (DOSH/OSHA), dan langkah mitigasi.'
      },
      {
        id: 'O7',
        categoryId: 'O',
        number: 7,
        text: 'Syarikat kami sentiasa memantau dan menganalisis kadar produktiviti operasi secara berkala.',
        guidance: 'Penjejakan KPI harian/bulanan seperti jam kerja berkesan, output setiap pekerja, masa pusing ganti.'
      },
      {
        id: 'O8',
        categoryId: 'O',
        number: 8,
        text: 'Syarikat kami menguruskan bekalan bahan, inventori, atau sumber perkhidmatan secara sistematik.',
        guidance: 'Sistem pengurusan stok (FIFO, JIT), tiada lebihan stok lapuk atau kehabisan bekalan kritikal.'
      },
      {
        id: 'O9',
        categoryId: 'O',
        number: 9,
        text: 'Premis dan fasiliti perniagaan kami menyokong kelancaran serta kecekapan operasi harian.',
        guidance: 'Susun atur bengkel/pejabat/kedai yang ergonomik, peralatan diselenggara dengan baik.'
      },
      {
        id: 'O10',
        categoryId: 'O',
        number: 10,
        text: 'Syarikat kami mempunyai pelan kontingensi bagi memastikan kelangsungan operasi sekiranya berlaku gangguan luar jangka.',
        guidance: 'Pelan kesinambungan perniagaan (BCP) jika berlaku bencana alam, ketiadaan bekalan atau gangguan staf.'
      }
    ]
  },
  {
    id: 'F',
    code: 'FIN',
    letter: 'F',
    name: 'Finance (Kewangan)',
    shortName: 'Kewangan',
    description: 'Kesihatan aliran tunai, pengurusan akaun, simpan kira patuh piawaian, dan perancangan modal.',
    badgeColor: 'bg-emerald-600 text-white',
    iconName: 'BadgeDollarSign',
    questions: [
      {
        id: 'F1',
        categoryId: 'F',
        number: 1,
        text: 'Aset semasa syarikat melebihi tanggungan semasa bagi memastikan aliran tunai harian yang sihat.',
        guidance: 'Nisbah semasa (current ratio) yang sihat (> 1.2x) untuk menampung liabiliti jangka pendek.'
      },
      {
        id: 'F2',
        categoryId: 'F',
        number: 2,
        text: 'Syarikat kami mencatatkan keuntungan bersih yang stabil dan konsisten setiap tahun.',
        guidance: 'Margin keuntungan positif dan rekod prestasi kewangan yang mampan dari tahun ke tahun.'
      },
      {
        id: 'F3',
        categoryId: 'F',
        number: 3,
        text: 'Syarikat kami mempunyai kedudukan ekuiti dan simpanan kewangan yang kukuh untuk kegunaan masa depan.',
        guidance: 'Rizab tunai kecemasan sekurang-kurangnya 3 hingga 6 bulan kos operasi perniagaan.'
      },
      {
        id: 'F4',
        categoryId: 'F',
        number: 4,
        text: 'Syarikat kami merekod dan menyimpan semua maklumat serta transaksi kewangan secara teratur.',
        guidance: 'Resit, invois, baucar bayaran, dan penyata bank disimpan secara digital dan fizikal.'
      },
      {
        id: 'F5',
        categoryId: 'F',
        number: 5,
        text: 'Syarikat kami mempunyai kakitangan atau khidmat profesional yang ditugaskan khusus untuk menguruskan akaun dan kewangan.',
        guidance: 'Akauntan dalaman atau melanggan firma perakaunan bertauliah profesional.'
      },
      {
        id: 'F6',
        categoryId: 'F',
        number: 6,
        text: 'Syarikat kami menggunakan sistem atau perisian akaun/simpan kira yang sah dan berstruktur.',
        guidance: 'Perisian perakaunan moden seperti Bukku, SQL Account, Xero, AutoCount, atau QuickBooks.'
      },
      {
        id: 'F7',
        categoryId: 'F',
        number: 7,
        text: 'Syarikat kami menguruskan kutipan penghutang dan pembayaran pemiutang mengikut tempoh yang ditetapkan.',
        guidance: 'Kawalan kredit ketat, penuaan hutang (aging report) dipantau, pembayaran pembekal tepat masa.'
      },
      {
        id: 'F8',
        categoryId: 'F',
        number: 8,
        text: 'Hasil pendapatan bulanan syarikat sentiasa mencukupi untuk menampung kos operasi harian dan overhed.',
        guidance: 'Aliran tunai operasi sentiasa positif tanpa kebergantungan melampau kepada pinjaman peribadi.'
      },
      {
        id: 'F9',
        categoryId: 'F',
        number: 9,
        text: 'Syarikat kami menyediakan dan mengaudit penyata kewangan tahunan secara berkala.',
        guidance: 'Penyata akaun beraudit dihantar tepat masa ke SSM & LHDN setiap tahun kewangan.'
      },
      {
        id: 'F10',
        categoryId: 'F',
        number: 10,
        text: 'Syarikat kami mempunyai perancangan modal yang kukuh untuk menampung pertumbuhan atau ekspansi perniagaan.',
        guidance: 'Pelan belanjawan modal (capex), hubungan baik dengan institusi perbankan atau kemudahan pembiayaan.'
      }
    ]
  },
  {
    id: 'A',
    code: 'ADM',
    letter: 'A',
    name: 'Administration (Pentadbiran & Sumber Manusia)',
    shortName: 'Pentadbiran & HR',
    description: 'Struktur organisasi, tadbir urus, pematuhan undang-undang buruh, skim ganjaran, dan latihan modal insan.',
    badgeColor: 'bg-indigo-600 text-white',
    iconName: 'Users',
    questions: [
      {
        id: 'A1',
        categoryId: 'A',
        number: 1,
        text: 'Syarikat kami mempunyai carta organisasi dan struktur pentadbiran yang jelas serta dikemaskini.',
        guidance: 'Garis pelaporan yang telus, peranan kepimpinan dan pembahagian unit kerja yang tersusun.'
      },
      {
        id: 'A2',
        categoryId: 'A',
        number: 2,
        text: 'Setiap warga kerja mempunyai huraian skop tugas (job description) yang terperinci dan didokumenkan.',
        guidance: 'Surat pelantikan rasmi dan huraian KPI yang difahami dengan jelas oleh kakitangan.'
      },
      {
        id: 'A3',
        categoryId: 'A',
        number: 3,
        text: 'Syarikat kami mematuhi semua pendaftaran lesen, permit, dan undang-undang Pihak Berkuasa Tempatan (PBT).',
        guidance: 'Lesen premis, papan iklan, permit perniagaan yang sentiasa diperbaharui tanpa tunggakan.'
      },
      {
        id: 'A4',
        categoryId: 'A',
        number: 4,
        text: 'Syarikat kami melindungi aset, premis, dan warga kerja dengan perlindungan insurans yang bersesuaian.',
        guidance: 'Insurans liabiliti awam, kebakaran bangunan/stok, atau insurans kemalangan berkelompok.'
      },
      {
        id: 'A5',
        categoryId: 'A',
        number: 5,
        text: 'Syarikat kami mempunyai jumlah tenaga kerja yang mencukupi untuk mengendalikan tugasan harian.',
        guidance: 'Tiada ketegangan atau kerja lebih masa kronik disebabkan kekurangan tenaga kerja.'
      },
      {
        id: 'A6',
        categoryId: 'A',
        number: 6,
        text: 'Syarikat kami disokong oleh tenaga kerja yang mempunyai kelayakan, kemahiran, atau pengalaman yang sesuai.',
        guidance: 'Padanan bakat yang tepat dengan fungsi tugas bagi memastikan kualiti hasil kerja.'
      },
      {
        id: 'A7',
        categoryId: 'A',
        number: 7,
        text: 'Syarikat kami sentiasa mematuhi caruman wajib dan menjaga kebajikan pekerja mengikut undang-undang tempatan.',
        guidance: 'Caruman KWSP (EPF), PERKESO (SOCSO), EIS, dan HRD Corp dipatuhi mengikut Akta Kerja.'
      },
      {
        id: 'A8',
        categoryId: 'A',
        number: 8,
        text: 'Pihak pengurusan menyediakan program latihan dan pembangunan kemahiran kepada pekerja secara berkala.',
        guidance: 'Bengkel peningkatan kemahiran teknikal, latihan kepimpinan atau keselamatan sekurang-kurangnya sekali setahun.'
      },
      {
        id: 'A9',
        categoryId: 'A',
        number: 9,
        text: 'Syarikat kami mempunyai skim ganjaran atau insentif yang berkesan untuk mengekalkan pekerja berkualiti.',
        guidance: 'Bonus prestasi, komisen berstruktur, kenaikan pangkat telus, dan faedah perubatan.'
      },
      {
        id: 'A10',
        categoryId: 'A',
        number: 10,
        text: 'Syarikat kami mengamalkan etika kerja dan tatakelakuan perniagaan yang jelas di semua peringkat organisasi.',
        guidance: 'Buku panduan pekerja (employee handbook), integriti antirasuah, dan budaya kerja profesional.'
      }
    ]
  },
  {
    id: 'S_SALES',
    code: 'SLS',
    letter: 'S',
    name: 'Sales (Jualan & Prestasi Perniagaan)',
    shortName: 'Jualan & Hasil',
    description: 'Pertumbuhan pendapatan, kepelbagaian portfolio pelanggan, daya saing pasaran, dan saluran jualan mampan.',
    badgeColor: 'bg-blue-600 text-white',
    iconName: 'TrendingUp',
    questions: [
      {
        id: 'S_SALES1',
        categoryId: 'S_SALES',
        number: 1,
        text: 'Jumlah jualan tahunan syarikat menunjukkan peningkatan berterusan dari tahun ke tahun.',
        guidance: 'Graf pertumbuhan hasil positif bagi sekurang-kurangnya 2 tahun kebelakangan ini.'
      },
      {
        id: 'S_SALES2',
        categoryId: 'S_SALES',
        number: 2,
        text: 'Purata kadar pertumbuhan jualan syarikat dalam tempoh 3 tahun lepas mencapai sasaran yang ditetapkan.',
        guidance: 'Pencapaian KPI sasaran hasil perniagaan selari dengan unjuran pelan induk perniagaan.'
      },
      {
        id: 'S_SALES3',
        categoryId: 'S_SALES',
        number: 3,
        text: 'Syarikat kami mempunyai keupayaan untuk meluaskan pasaran jualan ke peringkat tempatan mahupun antarabangsa.',
        guidance: 'Peluasan cawangan, pengedaran ke negeri lain, atau potensi eksport pasaran luar negara.'
      },
      {
        id: 'S_SALES4',
        categoryId: 'S_SALES',
        number: 4,
        text: 'Produk atau perkhidmatan kami mempunyai kelebihan daya saing yang kuat berbanding pesaing di pasaran.',
        guidance: 'Kelebihan harga, kualiti superior, servis unggul, atau penyelesaian unik yang sukar ditiru.'
      },
      {
        id: 'S_SALES5',
        categoryId: 'S_SALES',
        number: 5,
        text: 'Syarikat kami mempunyai portfolio pelanggan yang pelbagai dan kerap melakukan pembelian berulang (recurring sales).',
        guidance: 'Hasil tidak bergantung kepada seorang pelanggan tunggal (>30% risiko konsentrasi).'
      },
      {
        id: 'S_SALES6',
        categoryId: 'S_SALES',
        number: 6,
        text: 'Syarikat kami berupaya menjalin kerjasama jualan atau menyertai rantai bekalan bersama syarikat yang lebih besar.',
        guidance: 'Menjadi vendor GLC, MNC, kontrak korporat B2B, atau rakan francais berwibawa.'
      },
      {
        id: 'S_SALES7',
        categoryId: 'S_SALES',
        number: 7,
        text: 'Syarikat kami mempunyai hak cipta, paten, atau keunikan tawaran yang melindungi hasil jualan kami.',
        guidance: 'Formula rahsia, reka bentuk perindustrian, hak cipta kandungan atau rahsia perdagangan.'
      },
      {
        id: 'S_SALES8',
        categoryId: 'S_SALES',
        number: 8,
        text: 'Syarikat kami sentiasa menambah baik kandungan tawaran atau pakej jualan mengikut kehendak pasaran terkini.',
        guidance: 'Pakej tawaran menarik mengikut trend semasa pengguna bagi memaksimumkan purata nilai pesanan (AOV).'
      },
      {
        id: 'S_SALES9',
        categoryId: 'S_SALES',
        number: 9,
        text: 'Prestasi jualan dan kejayaan perniagaan syarikat pernah menerima pengiktirafan atau anugerah industri.',
        guidance: 'Anugerah usahawan, pengiktirafan dewan perniagaan, atau penarafan bintang SME Corp (SCORE).'
      },
      {
        id: 'S_SALES10',
        categoryId: 'S_SALES',
        number: 10,
        text: 'Syarikat kami mempunyai strategi jualan yang jelas bagi memastikan kelangsungan pendapatan jangka panjang.',
        guidance: 'Saluran paip prospek (pipeline) yang konsisten, sasaran jualan bulanan, dan strategi penetapan harga mantap.'
      }
    ]
  },
  {
    id: 'S_SYSTEM',
    code: 'SYS',
    letter: 'S',
    name: 'System (Sistem & Teknologi Maklumat)',
    shortName: 'Sistem & IT',
    description: 'Transformasi digital, perisian pengurusan bersepadu, infrastruktur awan, dan automasi proses kerja.',
    badgeColor: 'bg-cyan-600 text-white',
    iconName: 'Server',
    questions: [
      {
        id: 'S_SYSTEM1',
        categoryId: 'S_SYSTEM',
        number: 1,
        text: 'Pihak pengurusan secara aktif menggalakkan penerimaan dan penggunaan teknologi dalam perniagaan.',
        guidance: 'Komitmen bajet dan kepimpinan dalam memacu pendigitalan perniagaan ke arah IR4.0.'
      },
      {
        id: 'S_SYSTEM2',
        categoryId: 'S_SYSTEM',
        number: 2,
        text: 'Syarikat kami menggunakan sistem atau perisian digital khusus untuk menyokong proses kerja teras.',
        guidance: 'Aplikasi ERP/WMS, perisian reka bentuk khusus, atau sistem pemantauan pengeluaran digital.'
      },
      {
        id: 'S_SYSTEM3',
        categoryId: 'S_SYSTEM',
        number: 3,
        text: 'Syarikat kami menggunakan perisian/sistem digital bagi menguruskan fungsi pentadbiran dan sumber manusia.',
        guidance: 'Sistem HRMS (rekod cuti atas talian, slip gaji digital, jejak kehadiran biometrik/GPS).'
      },
      {
        id: 'S_SYSTEM4',
        categoryId: 'S_SYSTEM',
        number: 4,
        text: 'Syarikat kami memanfaatkan sistem maklumat digital bagi pengurusan akaun, kewangan, dan rekod perniagaan.',
        guidance: 'Invois digital, pematuhan e-Invois LHDN, dan pelaporan kewangan automatik atas talian.'
      },
      {
        id: 'S_SYSTEM5',
        categoryId: 'S_SYSTEM',
        number: 5,
        text: 'Syarikat kami menggunakan sistem pengurusan jualan atau transaksi yang terintegrasi (seperti POS atau pangkalan data pelanggan).',
        guidance: 'Sistem POS awan, platform e-dagang bersepadu dengan gerbang pembayaran (payment gateway).'
      },
      {
        id: 'S_SYSTEM6',
        categoryId: 'S_SYSTEM',
        number: 6,
        text: 'Syarikat kami sentiasa mengemaskini perisian dan alatan IT untuk mengekalkan kecekapan perniagaan.',
        guidance: 'Penyelenggaraan perisian terkini, lesen sah, dan perkakasan komputer yang tidak usang.'
      },
      {
        id: 'S_SYSTEM7',
        categoryId: 'S_SYSTEM',
        number: 7,
        text: 'Syarikat kami mempunyai infrastruktur IT (seperti capaian internet, storan data, atau sistem awan) yang selamat dan stabil.',
        guidance: 'Jalur lebar berkelajuan tinggi, sandaran data automatik ke Cloud (Google Workspace / OneDrive / AWS).'
      },
      {
        id: 'S_SYSTEM8',
        categoryId: 'S_SYSTEM',
        number: 8,
        text: 'Syarikat kami menggunakan peranti dan teknologi maklumat untuk berkomunikasi serta berurusan dengan pihak luar/pelanggan.',
        guidance: 'Penggunaan WhatsApp Business API, automasi chatbots, atau platform portal pelanggan.'
      },
      {
        id: 'S_SYSTEM9',
        categoryId: 'S_SYSTEM',
        number: 9,
        text: 'Syarikat kami mempunyai peruntukan kewangan untuk tujuan penyelenggaraan dan naiktaraf sistem teknologi perniagaan.',
        guidance: 'Bajet tahunan untuk langganan SaaS, lesen IT, keselamatan siber, dan perkakasan kerja.'
      },
      {
        id: 'S_SYSTEM10',
        categoryId: 'S_SYSTEM',
        number: 10,
        text: 'Penggunaan sistem dan teknologi perniagaan di syarikat kami berjaya menjimatkan masa, kos, serta mengurangkan ralat manusia.',
        guidance: 'Peningkatan produktiviti yang terbukti melalui pengurangan kos operasi dan ketepatan data.'
      }
    ]
  }
];

export const MALAYSIAN_STATES = [
  'Johor',
  'Kedah',
  'Kelantan',
  'Melaka',
  'Negeri Sembilan',
  'Pahang',
  'Perak',
  'Perlis',
  'Pulau Pinang',
  'Sabah',
  'Sarawak',
  'Selangor',
  'Terengganu',
  'W.P. Kuala Lumpur',
  'W.P. Labuan',
  'W.P. Putrajaya'
];

export const LIKERT_OPTIONS = [
  { value: 1, label: 'Sangat Tidak Setuju', shortLabel: 'STS', color: 'text-rose-600 bg-rose-50 border-rose-200' },
  { value: 2, label: 'Tidak Setuju', shortLabel: 'TS', color: 'text-orange-600 bg-orange-50 border-orange-200' },
  { value: 3, label: 'Sederhana / Kurang Pasti', shortLabel: 'S', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { value: 4, label: 'Setuju', shortLabel: 'ST', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { value: 5, label: 'Sangat Setuju', shortLabel: 'SS', color: 'text-teal-700 bg-teal-50 border-teal-200' }
];

export const GOVERNMENT_PROGRAMS_CATALOG = [
  {
    agency: 'SME Corp Malaysia',
    programName: 'Program Peningkatan Keupayaan PKS (BAP / CORE)',
    eligibility: 'PMKS tempatan sekurang-kurangnya 60% pemilikan ekuiti Malaysia, operasi minima 1 tahun.',
    supportType: 'Geran Sepadan' as const,
    description: 'Bantuan pembiayaan geran sepadan (sehingga 50%) bagi pensijilan kualiti, perolehan mesin berteknologi tinggi, dan penjenamaan.',
    targetCategory: ['M', 'O', 'S_SYSTEM'] as MofassCategoryId[]
  },
  {
    agency: 'MDEC (Malaysia Digital Economy Corporation)',
    programName: 'Geran Automasi & Pendigitalan Pintar PMKS (SME Digital Grant)',
    eligibility: 'PMKS yang ingin mengintegrasikan sistem digital, e-Invois, POS awan, atau e-Dagang.',
    supportType: 'Geran Sepadan' as const,
    description: 'Pembiayaan padanan sehingga RM5,000 bagi langganan perisian digital, sistem perakaunan atas talian, dan pemasaran digital.',
    targetCategory: ['S_SYSTEM', 'F', 'M'] as MofassCategoryId[]
  },
  {
    agency: 'MATRADE (Malaysia External Trade Development)',
    programName: 'Market Development Grant (MDG)',
    eligibility: 'PMKS yang ingin meneroka pasaran eksport serantau dan antarabangsa.',
    supportType: 'Geran Sepadan' as const,
    description: 'Geran boleh tuntut sehingga RM300,000 bagi penyertaan dalam misi dagangan antarabangsa, promosi eksport maya, dan pendaftaran cap dagangan luar negara.',
    targetCategory: ['S_SALES', 'M'] as MofassCategoryId[]
  },
  {
    agency: 'MARA (Majlis Amanah Rakyat)',
    programName: 'Skim Pembiayaan Perniagaan Mudah (SPiM / MEGAPRO)',
    eligibility: 'Usahawan Bumiputera PMKS berdaya maju.',
    supportType: 'Pinjaman Mudah' as const,
    description: 'Kemudahan pembiayaan modal pusingan dan pembelian aset perniagaan dengan kadar keuntungan kompetitif dan tempoh bayaran fleksibel.',
    targetCategory: ['F', 'O'] as MofassCategoryId[]
  },
  {
    agency: 'SJPP (Syarikat Jaminan Pembiayaan Perniagaan)',
    programName: 'Skim Jaminan Modal Kerja & Peralatan Teknologi (WCS / GGS)',
    eligibility: 'PMKS Malaysia berdaftar yang memohon pembiayaan bank komersil.',
    supportType: 'Pinjaman Mudah' as const,
    description: 'Jaminan kerajaan sehingga 80% atas pinjaman bank bagi memudahkan kelulusan tanpa cagaran aset keras yang tinggi.',
    targetCategory: ['F', 'S_SYSTEM'] as MofassCategoryId[]
  },
  {
    agency: 'HRD Corp (Pembangunan Sumber Manusia Berhad)',
    programName: 'Skim Bantuan Latihan (SBL-Khas)',
    eligibility: 'Majikan berdaftar dengan HRD Corp bagi latihan pekerja.',
    supportType: 'Bimbingan & Latihan' as const,
    description: 'Pembiayaan kos yuran kursus dan elaun latihan peningkatan kemahiran staf dalam bidang operasi, jualan, digital, dan kepimpinan.',
    targetCategory: ['A', 'O'] as MofassCategoryId[]
  }
];

export const MATURITY_LEVEL_BENCHMARKS = {
  tahap1: {
    grade: 'Tahap 1' as const,
    name: 'Tahap Permulaan / Asas (Emerging)',
    minPercent: 0,
    maxPercent: 49.9,
    color: 'from-rose-500 to-red-600',
    badge: 'bg-rose-100 text-rose-800 border-rose-300',
    summary: 'Perniagaan masih berada di fasa pembentukan awal dengan kebergantungan tinggi kepada proses manual dan pemilik perniagaan secara langsung. Keutamaan segera adalah mewujudkan SOP asas, simpan kira teratur, dan pematuhan peraturan asas.'
  },
  tahap2: {
    grade: 'Tahap 2' as const,
    name: 'Tahap Membangun (Developing)',
    minPercent: 50,
    maxPercent: 69.9,
    color: 'from-amber-500 to-orange-600',
    badge: 'bg-amber-100 text-amber-800 border-amber-300',
    summary: 'Perniagaan mempunyai asas operasi yang sedang berkembang dengan aliran pendapatan yang stabil, namun masih menghadapi cabaran dari segi konsistensi proses, integrasi sistem teknologi, dan kawalan kos jangka panjang.'
  },
  tahap3: {
    grade: 'Tahap 3' as const,
    name: 'Tahap Kompeten / Mampan (Competent)',
    minPercent: 70,
    maxPercent: 84.9,
    color: 'from-emerald-500 to-teal-600',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    summary: 'Perniagaan mempunyai sistem operasi dan kewangan yang matang, aliran tunai yang sihat, serta keupayaan bersaing yang kukuh di pasaran domestik. Bersedia untuk penskalaan lebih agresif dan automasi menyeluruh.'
  },
  tahap4: {
    grade: 'Tahap 4' as const,
    name: 'Tahap Cemerlang / Peneraju Pasaran (Excellence / Leader)',
    minPercent: 85,
    maxPercent: 100,
    color: 'from-blue-600 to-indigo-700',
    badge: 'bg-blue-100 text-blue-800 border-blue-300',
    summary: 'Perniagaan berdaya tahan tinggi dengan amalan tadbir urus bertaraf industri, budaya inovasi berterusan, integrasi sistem digital pintar yang lengkap, dan berpotensi besar untuk menerajui pasaran serta berkembang ke persada antarabangsa/eksport.'
  }
};
