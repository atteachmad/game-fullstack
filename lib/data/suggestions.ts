import type { Language } from "@/types";

export type SuggestionKind =
  | "class"
  | "constant"
  | "function"
  | "keyword"
  | "method"
  | "property"
  | "text"
  | "type"
  | "variable";

/**
 * Satu saran kode. Template memakai sintaks snippet CodeMirror:
 * ${1:teks} adalah titik isian (tekan Tab untuk pindah ke isian berikutnya).
 * Data murni (bisa diserialisasi), siap dipindah ke database.
 */
export interface CodeSuggestion {
  label: string;
  template: string;
  detail: string;
  info: string;
  type: SuggestionKind;
}

export const ALL_LANGUAGES: readonly Language[] = [
  "html",
  "css",
  "javascript",
  "php",
  "react",
  "vue",
  "laravel",
  "nextjs",
];

export const LANGUAGE_LABELS: Record<Language, string> = {
  html: "HTML",
  css: "CSS",
  javascript: "JavaScript",
  php: "PHP",
  react: "React",
  vue: "Vue",
  laravel: "Laravel",
  nextjs: "Next.js",
};

function item(
  label: string,
  template: string,
  detail: string,
  info: string,
  type: SuggestionKind = "keyword"
): CodeSuggestion {
  return { label, template, detail, info, type };
}

const HTML: CodeSuggestion[] = [
  item("<h1", '<h1>${1:Judul utama}</h1>', "judul", "Judul terbesar halaman. Pakai satu saja per halaman."),
  item("<p", "<p>${1:Isi paragraf}</p>", "paragraf", "Blok teks biasa."),
  item("<a", '<a href="${1:https://}">${2:teks tautan}</a>', "tautan", "Tautan ke halaman lain."),
  item("<img", '<img src="${1:gambar.jpg}" alt="${2:deskripsi gambar}" />', "gambar", "Menampilkan gambar. Atribut alt wajib untuk aksesibilitas."),
  item("<ul", "<ul>\n  <li>${1:item}</li>\n</ul>", "daftar", "Daftar berpoin. Tiap isi memakai tag <li>."),
  item("<button", '<button type="${1:button}">${2:Klik saya}</button>', "tombol", "Tombol yang bisa diklik."),
  item("<form", '<form>\n  <label>${1:Nama}</label>\n  <input type="${2:text}" placeholder="${3:Tulis di sini}" />\n  <button type="submit">${4:Kirim}</button>\n</form>', "formulir", "Formulir lengkap dengan label, kolom isian, dan tombol kirim."),
  item("<input", '<input type="${1:text}" placeholder="${2:Tulis di sini}" />', "kolom isian", "Kolom input. Ubah type menjadi email, password, number, dan lainnya."),
  item("<label", "<label>${1:Label}</label>", "label", "Teks penjelas untuk kolom isian."),
  item("<div", '<div class="${1:kotak}">\n  ${2}\n</div>', "wadah", "Wadah umum untuk mengelompokkan elemen."),
  item("<section", "<section>\n  ${1}\n</section>", "bagian", "Bagian bermakna dari halaman."),
  item("<nav", '<nav>\n  <a href="${1:#}">${2:Beranda}</a>\n</nav>', "navigasi", "Kumpulan tautan navigasi."),
];

const CSS: CodeSuggestion[] = [
  item("display", "display: ${1:flex};", "tata letak", "Mengatur jenis tampilan elemen: block, flex, grid, none.", "property"),
  item("justify-content", "justify-content: ${1:center};", "flexbox", "Mengatur posisi anak elemen di sumbu utama flex.", "property"),
  item("align-items", "align-items: ${1:center};", "flexbox", "Mengatur posisi anak elemen di sumbu silang flex.", "property"),
  item("padding", "padding: ${1:16px};", "jarak dalam", "Jarak antara isi dan tepi elemen.", "property"),
  item("margin", "margin: ${1:16px};", "jarak luar", "Jarak antara elemen dan elemen di sekitarnya.", "property"),
  item("border-radius", "border-radius: ${1:16px};", "sudut", "Membuat sudut membulat.", "property"),
  item("box-shadow", "box-shadow: 0 ${1:8px} 0 ${2:#3b1d8f};", "bayangan", "Bayangan padat di bawah elemen memberi kesan tebal 3D.", "property"),
  item("background", "background: ${1:#7c3aed};", "latar", "Warna atau gambar latar belakang.", "property"),
  item("linear-gradient", "background: linear-gradient(${1:135deg}, ${2:#7c3aed}, ${3:#22d3ee});", "gradasi", "Gradasi dua warna atau lebih.", "function"),
  item("transform", "transform: ${1:translateY(6px)};", "transformasi", "Menggeser, memutar, atau memperbesar elemen.", "property"),
  item("transition", "transition: ${1:all} ${2:0.2s} ${3:ease};", "transisi", "Perubahan halus saat properti berubah.", "property"),
  item("color", "color: ${1:white};", "warna teks", "Warna teks.", "property"),
  item("font-size", "font-size: ${1:16px};", "ukuran teks", "Ukuran huruf.", "property"),
  item(":hover", ":hover {\n  ${1:background: #8b5cf6;}\n}", "kursor di atas", "Gaya saat kursor berada di atas elemen.", "class"),
  item(":active", ":active {\n  ${1:transform: translateY(6px);}\n}", "saat ditekan", "Gaya saat elemen sedang ditekan.", "class"),
  item("@keyframes", "@keyframes ${1:nama} {\n  from {\n    ${2:opacity: 0;}\n  }\n  to {\n    opacity: 1;\n  }\n}", "animasi", "Mendefinisikan langkah-langkah animasi."),
  item("grid-template-columns", "grid-template-columns: ${1:repeat(3, 1fr)};", "grid", "Menentukan kolom pada layout grid.", "property"),
];

const JAVASCRIPT: CodeSuggestion[] = [
  item("const", "const ${1:nama} = ${2:nilai};", "variabel tetap", "Variabel yang nilainya tidak akan diganti.", "keyword"),
  item("let", "let ${1:nama} = ${2:nilai};", "variabel", "Variabel yang nilainya boleh diganti.", "keyword"),
  item("function", "function ${1:namaFungsi}(${2:param}) {\n  ${3:// kode}\n}", "fungsi", "Kumpulan perintah yang bisa dipanggil berulang.", "function"),
  item("arrow", "const ${1:nama} = (${2:param}) => {\n  ${3:// kode}\n};", "fungsi panah", "Cara singkat menulis fungsi.", "function"),
  item("if", "if (${1:kondisi}) {\n  ${2:// kode}\n}", "percabangan", "Menjalankan kode hanya jika kondisi benar.", "keyword"),
  item("for", "for (let ${1:i} = 0; ${1:i} < ${2:10}; ${1:i}++) {\n  ${3:// kode}\n}", "perulangan", "Mengulang kode beberapa kali.", "keyword"),
  item("console.log", "console.log(${1:\"Halo\"});", "tampilkan", "Menampilkan pesan di panel output.", "method"),
  item("document.querySelector", 'document.querySelector("${1:.selector}")', "cari elemen", "Mengambil satu elemen halaman berdasarkan selector CSS.", "method"),
  item("addEventListener", '${1:elemen}.addEventListener("${2:click}", () => {\n  ${3:// kode}\n});', "dengar peristiwa", "Menjalankan kode saat peristiwa terjadi, misalnya klik.", "method"),
  item("setTimeout", "setTimeout(() => {\n  ${1:// kode}\n}, ${2:1000});", "tunda", "Menjalankan kode setelah jeda (milidetik).", "function"),
  item("fetch", 'fetch("${1:/api/data}")\n  .then((res) => res.json())\n  .then((data) => console.log(data));', "ambil data", "Mengambil data dari server atau API.", "function"),
  item("map", "${1:daftar}.map((${2:item}) => ${3:item})", "ubah daftar", "Membuat daftar baru dari hasil transformasi tiap item.", "method"),
  item("filter", "${1:daftar}.filter((${2:item}) => ${3:kondisi})", "saring daftar", "Membuat daftar baru berisi item yang memenuhi syarat.", "method"),
  item("forEach", "${1:daftar}.forEach((${2:item}) => {\n  ${3:// kode}\n});", "ulangi daftar", "Menjalankan kode untuk setiap item.", "method"),
];

const PHP: CodeSuggestion[] = [
  item("echo", 'echo ${1:"Halo"};', "tampilkan", "Menampilkan teks ke halaman.", "keyword"),
  item("$var", "$${1:nama} = ${2:nilai};", "variabel", "Variabel PHP selalu diawali tanda $.", "variable"),
  item("if", "if (${1:kondisi}) {\n    ${2:// kode}\n}", "percabangan", "Menjalankan kode hanya jika kondisi benar.", "keyword"),
  item("foreach", "foreach ($${1:daftar} as $${2:item}) {\n    ${3:// kode}\n}", "perulangan", "Mengulang untuk setiap item dalam array.", "keyword"),
  item("function", "function ${1:namaFungsi}($${2:param}) {\n    ${3:// kode}\n}", "fungsi", "Kumpulan perintah yang bisa dipanggil berulang.", "function"),
  item("array", "$${1:nama} = [${2:\"satu\", \"dua\"}];", "array", "Daftar nilai.", "type"),
  item("class", "class ${1:NamaKelas}\n{\n    public function ${2:namaMetode}()\n    {\n        ${3:// kode}\n    }\n}", "kelas", "Cetak biru objek.", "class"),
  item("isset", "isset($${1:variabel})", "cek ada", "Memeriksa apakah variabel sudah ada dan bukan null.", "function"),
  item("json_encode", "json_encode($${1:data})", "ke JSON", "Mengubah array menjadi teks JSON.", "function"),
];

const REACT: CodeSuggestion[] = [
  item("useState", "const [${1:nilai}, set${2:Nilai}] = useState(${3:0});", "state", "Menyimpan data yang berubah dan memicu tampilan ulang.", "function"),
  item("useEffect", "useEffect(() => {\n  ${1:// efek samping}\n}, [${2}]);", "efek", "Menjalankan kode setelah komponen tampil atau data berubah.", "function"),
  item("useRef", "const ${1:ref} = useRef(${2:null});", "referensi", "Menyimpan referensi ke elemen tanpa memicu tampilan ulang.", "function"),
  item("component", "export default function ${1:NamaKomponen}() {\n  return (\n    <div>\n      ${2}\n    </div>\n  );\n}", "komponen", "Kerangka komponen fungsi React.", "class"),
  item("onClick", "onClick={${1:handleClick}}", "saat klik", "Menjalankan fungsi ketika elemen diklik.", "property"),
  item("className", 'className="${1:kelas}"', "kelas CSS", "Di React, atribut class ditulis className.", "property"),
  item("list", "{${1:daftar}.map((${2:item}) => (\n  <li key={${2:item}.id}>{${2:item}.nama}</li>\n))}", "tampilkan daftar", "Merender daftar. Setiap item butuh key yang unik.", "method"),
  item("props", "function ${1:Komponen}({ ${2:judul} }) {\n  return <h2>{${2:judul}}</h2>;\n}", "properti", "Data yang dikirim dari komponen induk.", "class"),
];

const VUE: CodeSuggestion[] = [
  item("script setup", '<script setup>\nimport { ref } from "vue";\n\n${1}\n</script>', "skrip", "Blok skrip modern Vue dengan Composition API.", "keyword"),
  item("ref", "const ${1:nilai} = ref(${2:0});", "state", "Menyimpan data reaktif. Akses nilainya lewat .value di skrip.", "function"),
  item("computed", "const ${1:hasil} = computed(() => ${2:nilai});", "nilai turunan", "Nilai yang dihitung otomatis dari data lain.", "function"),
  item("v-if", 'v-if="${1:kondisi}"', "tampil bersyarat", "Menampilkan elemen hanya jika kondisi benar.", "property"),
  item("v-for", 'v-for="${1:item} in ${2:daftar}" :key="${1:item}.id"', "perulangan", "Mengulang elemen untuk setiap item.", "property"),
  item("v-model", 'v-model="${1:nilai}"', "ikat data", "Menghubungkan kolom isian dengan data dua arah.", "property"),
  item("@click", '@click="${1:handler}"', "saat klik", "Menjalankan fungsi ketika elemen diklik.", "property"),
  item(":class", ':class="{ ${1:aktif}: ${2:kondisi} }"', "kelas dinamis", "Menambah kelas CSS berdasarkan kondisi.", "property"),
  item("<template", "<template>\n  ${1}\n</template>", "templat", "Blok tampilan komponen Vue."),
];

const LARAVEL: CodeSuggestion[] = [
  item("Route::get", 'Route::get("${1:/halaman}", function () {\n    return view("${2:welcome}");\n});', "rute GET", "Menentukan apa yang tampil saat alamat tertentu dibuka.", "method"),
  item("Route::post", 'Route::post("${1:/kirim}", [${2:KontrolerController}::class, "${3:store}"]);', "rute POST", "Menerima data yang dikirim dari formulir.", "method"),
  item("view", 'return view("${1:nama.tampilan}", ["${2:data}" => $${3:data}]);', "tampilan", "Menampilkan file Blade dan mengirim data ke dalamnya.", "function"),
  item("validate", '$request->validate([\n    "${1:nama}" => "required|max:255",\n]);', "validasi", "Memeriksa data masukan sebelum diproses.", "method"),
  item("Model::all", "${1:Post}::all()", "ambil semua", "Mengambil semua baris dari tabel lewat Eloquent.", "method"),
  item("Model::find", "${1:Post}::find($${2:id})", "cari satu", "Mengambil satu baris berdasarkan ID.", "method"),
  item("Model::create", "${1:Post}::create([\n    \"${2:judul}\" => $request->${2:judul},\n]);", "simpan data", "Menyimpan baris baru ke database.", "method"),
  item("@foreach", "@foreach ($${1:items} as $${2:item})\n    {{ $${2:item} }}\n@endforeach", "Blade perulangan", "Mengulang tampilan untuk setiap item.", "keyword"),
  item("@if", "@if (${1:kondisi})\n    ${2}\n@endif", "Blade percabangan", "Menampilkan bagian tertentu hanya jika kondisi benar.", "keyword"),
];

const NEXTJS: CodeSuggestion[] = [
  item("use client", '"use client";\n', "komponen klien", "Menandai komponen agar berjalan di browser (boleh memakai state dan event).", "keyword"),
  item("page", "export default function ${1:Page}() {\n  return (\n    <main>\n      ${2}\n    </main>\n  );\n}", "halaman", "Berkas page.tsx menentukan isi sebuah rute di App Router.", "class"),
  item("Link", '<Link href="${1:/halaman}">${2:Teks}</Link>', "navigasi", "Pindah halaman tanpa memuat ulang seluruh situs.", "class"),
  item("Image", '<Image src="${1:/gambar.png}" alt="${2:deskripsi}" width={${3:400}} height={${4:300}} />', "gambar", "Gambar yang dioptimalkan otomatis oleh Next.js.", "class"),
  item("useRouter", "const router = useRouter();", "router", "Berpindah halaman lewat kode, misalnya router.push().", "function"),
  item("metadata", 'export const metadata = {\n  title: "${1:Judul Halaman}",\n  description: "${2:Deskripsi}",\n};', "metadata", "Mengatur judul dan deskripsi halaman untuk SEO.", "constant"),
  item("GET", "export async function GET() {\n  return Response.json({ ${1:pesan}: \"${2:Halo}\" });\n}", "API route", "Endpoint API di berkas route.ts.", "function"),
  item("layout", "export default function ${1:Layout}({ children }) {\n  return (\n    <html lang=\"id\">\n      <body>{children}</body>\n    </html>\n  );\n}", "layout", "Kerangka yang membungkus halaman-halaman.", "class"),
];

const SUGGESTIONS: Record<Language, CodeSuggestion[]> = {
  html: HTML,
  css: CSS,
  javascript: JAVASCRIPT,
  php: PHP,
  react: REACT,
  vue: VUE,
  laravel: LARAVEL,
  nextjs: NEXTJS,
};

/** Bahasa yang saran kodenya ikut diwarisi (urutan = prioritas). */
const INHERITS: Partial<Record<Language, Language[]>> = {
  react: ["javascript"],
  nextjs: ["react", "javascript"],
  vue: ["html", "javascript"],
  laravel: ["php", "html"],
};

/** Saran milik bahasa itu sendiri lebih dulu, lalu yang diwarisi. Tanpa duplikat. */
export function getSuggestions(language: Language): CodeSuggestion[] {
  const seen = new Set<string>();
  const result: CodeSuggestion[] = [];

  for (const lang of [language, ...(INHERITS[language] ?? [])]) {
    for (const entry of SUGGESTIONS[lang]) {
      if (seen.has(entry.label)) continue;
      seen.add(entry.label);
      result.push(entry);
    }
  }
  return result;
}