import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const FILTER_OPTIONS = {
  genre: [
    { value: 'aksi', label: 'Aksi' }, { value: 'anak-anak', label: 'Anak-Anak' },
    { value: 'luar-angkasa', label: 'Antariksa' }, { value: 'avant-garde', label: 'Avant Garde' },
    { value: 'dementia', label: 'Dimensia' }, { value: 'donghua', label: 'Donghua' },
    { value: 'drama', label: 'Drama' }, { value: 'ecchi', label: 'Ecchi' },
    { value: 'fantasi', label: 'Fantasi' }, { value: 'fantasi-urban', label: 'Fantasi Urban' },
    { value: 'game', label: 'Game' }, { value: 'gourmet', label: 'Gourmet' },
    { value: 'harem', label: 'Harem' }, { value: 'horror', label: 'Horror' },
    { value: 'iblis', label: 'Iblis' }, { value: 'isekai', label: 'Isekai' },
    { value: 'josei', label: 'Josei' }, { value: 'suspense', label: 'Ketegangan' },
    { value: 'komedi', label: 'Komedi' }, { value: 'live-action', label: 'Live Action' },
    { value: 'makanan', label: 'Makanan' }, { value: 'martial-arts', label: 'Martial Arts' },
    { value: 'medical', label: 'Medis' }, { value: 'militer', label: 'Militer' },
    { value: 'misteri', label: 'Misteri' }, { value: 'mitologi', label: 'Mitologi' },
    { value: 'mobil', label: 'Mobil' }, { value: 'musik', label: 'Musik' },
    { value: 'olahraga', label: 'Olahraga' }, { value: 'parodi', label: 'Parodi' },
    { value: 'perang', label: 'Perang' }, { value: 'petualangan', label: 'Petualangan' },
    { value: 'polisi', label: 'Polisi' }, { value: 'politik', label: 'Politik' },
    { value: 'psikologis', label: 'Psikologis' }, { value: 'reincarnation', label: 'Reinkarnasi' },
    { value: 'mecha', label: 'Robot' }, { value: 'romansa', label: 'Romansa' },
    { value: 'samurai', label: 'Samurai' }, { value: 'sci-fi', label: 'Sci-Fi' },
    { value: 'seinen', label: 'Seinen' }, { value: 'sejarah', label: 'Sejarah' },
    { value: 'sekolahan', label: 'Sekolahan' }, { value: 'shoujo', label: 'Shoujo' },
    { value: 'shoujo-ai', label: 'Shoujo Ai' }, { value: 'shounen', label: 'Shounen' },
    { value: 'shounen-ai', label: 'Shounen Ai' }, { value: 'sihir', label: 'Sihir' },
    { value: 'slice-of-life', label: 'Slice of Life' }, { value: 'super-power', label: 'Super Power' },
    { value: 'supranatural', label: 'Supranatural' }, { value: 'thriller', label: 'Thriller' },
    { value: 'time-travel', label: 'Time Travel' }, { value: 'vampir', label: 'Vampir' },
    { value: 'wuxia', label: 'Wuxia' }, { value: 'yaoi', label: 'Yaoi' },
  ],
  status: [
    { value: '', label: 'Semua' }, { value: 'upcoming', label: 'Segera Tayang' },
    { value: 'ongoing', label: 'Sedang Tayang' }, { value: 'completed', label: 'Selesai Tayang' },
  ],
  tipe: [
    { value: '', label: 'Semua' }, { value: 'TV', label: 'Serial TV' },
    { value: 'Live Action', label: 'Live Action' }, { value: 'Movie', label: 'Movie' },
    { value: 'OVA', label: 'OVA' }, { value: 'ONA', label: 'ONA' },
    { value: 'Special', label: 'Spesial' }, { value: 'Music', label: 'Musik' },
  ],
  urutan: [
    { value: 'baru', label: 'Rilis Terbaru' }, { value: 'lama', label: 'Rilis Terlawas' },
    { value: 'update', label: 'Baru Diupdate' }, { value: 'publikasi', label: 'Baru Ditambah' },
    { value: 'populer', label: 'Terpopuler' }, { value: 'rating', label: 'Rating' },
    { value: 'abjad', label: 'Judul A→Z' }, { value: 'dari-z', label: 'Judul Z→A' },
    { value: 'default', label: 'Standar' },
  ],
};

export async function GET() {
  return NextResponse.json({ success: true, source: 'Animasu', data: FILTER_OPTIONS });
}
