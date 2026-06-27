import Link from "next/link";  
  
export default function PartnerInfoPage() {  
  return (  
    <div className="min-h-screen bg-neutral-50 px-4 py-10">  
      <div className="mx-auto w-full max-w-5xl space-y-6">  
        <div className="rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">  
          <h1 className="text-xl font-medium text-neutral-900">Info</h1>  
          <p className="mt-1 text-sm text-neutral-500">  
            Halaman ini berisi referensi teknis, dokumen API, dan panduan  
            integrasi yang digunakan selama proses implementasi dan pengujian.  
          </p>  
        </div>  
  
        <div className="grid gap-4 md:grid-cols-2">  
          <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">  
            <h2 className="text-lg font-medium text-neutral-900">  
              API Specification  
            </h2>  
            <p className="mt-2 text-sm leading-6 text-neutral-500">  
              Gunakan dokumen API specification sebagai referensi utama untuk  
              request, response, struktur parameter, dan skenario pengujian.  
            </p>  
  
            <div className="mt-4">  
              <a  
                href="#"  
                className="inline-flex rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"  
              >  
                Buka Dokumen API Spec  
              </a>  
            </div>  
          </div>  
  
          <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">  
            <h2 className="text-lg font-medium text-neutral-900">  
              Panduan Integrasi  
            </h2>  
            <p className="mt-2 text-sm leading-6 text-neutral-500">  
              Pelajari langkah integrasi, requirement teknis, dan panduan umum  
              sebelum memulai implementasi service yang dipilih.  
            </p>  
  
            <div className="mt-4">  
              <a  
                href="#"  
                className="inline-flex rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"  
              >  
                Lihat Panduan Integrasi  
              </a>  
            </div>  
          </div>  
        </div>  
  
        <div className="rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">  
          <h2 className="text-lg font-medium text-neutral-900">  
            Catatan Penting  
          </h2>  
  
          <div className="mt-4 space-y-3 text-sm leading-6 text-neutral-600">  
            <p>  
              1. Pastikan service yang dipilih pada menu <span className="font-medium text-neutral-900">Services</span> sesuai  
              dengan implementasi yang benar-benar akan dilakukan.  
            </p>  
            <p>  
              2. Gunakan API specification versi terbaru untuk menghindari  
              ketidaksesuaian parameter saat pengujian.  
            </p>  
            <p>  
              3. Simpan perubahan scope sebelum melanjutkan ke proses pengujian.  
            </p>  
            <p>  
              4. Jika terdapat perubahan requirement atau dokumentasi, gunakan  
              referensi terbaru yang disediakan oleh tim administrator.  
            </p>  
          </div>  
        </div>  
  
        <div className="rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">  
          <h2 className="text-lg font-medium text-neutral-900">  
            Navigasi Cepat  
          </h2>  
  
          <div className="mt-4 flex flex-wrap gap-3">  
            <Link  
              href="/partner/home"  
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"  
            >  
              Kembali ke Home  
            </Link>  
  
            <Link  
              href="/partner/services"  
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"  
            >  
              Buka Services  
            </Link>  
          </div>  
        </div>  
      </div>  
    </div>  
  );  
}