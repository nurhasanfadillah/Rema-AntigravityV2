import { Routes, Route } from 'react-router-dom';
import { MobileLayout } from './components/layout/MobileLayout';
import { Dashboard } from './pages/Dashboard';
import { MitraList } from './pages/Mitra/MitraList';
import { KategoriList } from './pages/Kategori/KategoriList';
import { ProdukList } from './pages/Produk/ProdukList';
import { PesananList } from './pages/Pesanan/PesananList';
import { PesananBaru } from './pages/Pesanan/PesananBaru';
import { PesananDetail } from './pages/Pesanan/PesananDetail';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MobileLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="mitra" element={<MitraList />} />
        <Route path="kategori" element={<KategoriList />} />
        <Route path="produk" element={<ProdukList />} />
        <Route path="pesanan">
          <Route index element={<PesananList />} />
          <Route path="baru" element={<PesananBaru />} />
          <Route path=":id" element={<PesananDetail />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
