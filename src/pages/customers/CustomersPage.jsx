import { useEffect, useState } from "react";
import { isSupabaseConfigured } from "../../lib/supabase";
import { fetchCustomers } from "../../services/customersService";
import { CustomersTable } from "../../components/tables/CustomersTable";
import { customerRows } from "../../data/mockData";

export function CustomersPage() {
  const [rows, setRows] = useState(customerRows);
  const [statusMessage, setStatusMessage] = useState(
    isSupabaseConfigured
      ? "Mengambil data pelanggan dari Supabase..."
      : "Mode demo aktif. Halaman pelanggan masih memakai data contoh.",
  );

  useEffect(() => {
    async function loadCustomers() {
      if (!isSupabaseConfigured) {
        return;
      }

      try {
        const data = await fetchCustomers();
        setRows(data);
        setStatusMessage(
          data.length > 0
            ? "Data pelanggan berhasil dimuat dari Supabase."
            : "Tabel customers sudah terhubung, tetapi belum berisi data.",
        );
      } catch (error) {
        console.error(error);
        setStatusMessage(
          "Tabel customers belum siap atau belum dibuat di Supabase. Data contoh ditampilkan sementara.",
        );
      }
    }

    loadCustomers();
  }, []);

  return (
    <section className="page-stack">
      <div className="page-header-card status-card">
        <div>
          <p className="eyebrow">Status pelanggan</p>
          <h2>Pelanggan dari Supabase</h2>
          <p className="muted-copy">{statusMessage}</p>
        </div>
      </div>

      <div className="page-header-card split-card">
        <div>
          <p className="eyebrow">Data pelanggan</p>
          <h2>Hubungan pelanggan yang lebih rapi dan mudah dicari</h2>
          <p className="muted-copy">
            Simpan nomor HP, catatan penting, dan riwayat transaksi agar layanan
            makin cepat saat pelanggan kembali.
          </p>
        </div>

        <div className="stat-pile">
          <div>
            <strong>{rows.length}</strong>
            <span>pelanggan terdaftar</span>
          </div>
          <div>
            <strong>{rows.filter((item) => item.lastTransaction !== "-").length}</strong>
            <span>sudah punya riwayat</span>
          </div>
        </div>
      </div>

      <CustomersTable rows={rows} />
    </section>
  );
}
