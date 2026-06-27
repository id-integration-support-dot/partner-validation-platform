import Link from "next/link";  
  
export default function AdminDashboardPage() {  
  return (  
    <div className="px-4 py-8">  
      <div className="mx-auto w-full max-w-7xl space-y-6">  
        <div>  
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">  
            Dashboard  
          </h1>  
          <p className="mt-2 text-sm text-slate-500">  
            Ringkasan aktivitas pengujian partner dan proses approval.  
          </p>  
        </div>  
  
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">  
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">  
            <p className="text-sm text-slate-500">Total Partners</p>  
            <p className="mt-3 text-3xl font-semibold text-slate-900">10</p>  
            <p className="mt-2 text-sm text-slate-400">  
              Total partner terdaftar  
            </p>  
          </div>  
  
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">  
            <p className="text-sm text-slate-500">Pending Approval</p>  
            <p className="mt-3 text-3xl font-semibold text-slate-900">2</p>  
            <p className="mt-2 text-sm text-slate-400">  
              Menunggu review administrator  
            </p>  
          </div>  
  
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">  
            <p className="text-sm text-slate-500">Submissions</p>  
            <p className="mt-3 text-3xl font-semibold text-slate-900">10</p>  
            <p className="mt-2 text-sm text-slate-400">  
              Total submission partner  
            </p>  
          </div>  
  
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">  
            <p className="text-sm text-slate-500">Pass Rate</p>  
            <p className="mt-3 text-3xl font-semibold text-slate-900">50%</p>  
            <p className="mt-2 text-sm text-slate-400">  
              Rata-rata kelulusan pengujian  
            </p>  
          </div>  
        </div>  
  
        <div className="grid gap-4 xl:grid-cols-3">  
          <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm xl:col-span-2">  
            <h2 className="text-lg font-semibold text-slate-900">  
              Activity Overview  
            </h2>  
            <p className="mt-2 text-sm text-slate-500">  
              Ringkasan aktivitas partner, progress pengujian, dan submission.  
            </p>  
  
            <div className="mt-6 h-72 rounded-lg border border-dashed border-slate-300 bg-slate-50" />  
          </div>  
  
          <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">  
            <h2 className="text-lg font-semibold text-slate-900">  
              Approval Queue  
            </h2>  
            <p className="mt-2 text-sm text-slate-500">  
              Akses daftar request register partner yang masih menunggu approval.  
            </p>  
  
            <div className="mt-6 space-y-3">  
              <div className="rounded-md bg-slate-50 p-4 text-sm text-slate-600">  
                Partner pending review: 2  
              </div>  
              <div className="rounded-md bg-slate-50 p-4 text-sm text-slate-600">  
                Partner approved: 8  
              </div>  
              <div className="rounded-md bg-slate-50 p-4 text-sm text-slate-600">  
                Assessment completed: 5  
              </div>  
            </div>  
  
            <div className="mt-6">  
              <Link  
                href="/admin/partners"  
                className="inline-flex rounded-lg bg-[#0d5ddf] px-4 py-2 text-sm font-medium text-white hover:bg-[#0b4fc2]"  
              >  
                Lihat Request Partner  
              </Link>  
            </div>  
          </div>  
        </div>  
      </div>  
    </div>  
  );  
}