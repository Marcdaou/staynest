import { Route, Routes } from 'react-router-dom'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { Home } from './pages/Home'
import { ListingDetail } from './pages/ListingDetail'
import { Trips } from './pages/Trips'
import { Wishlists } from './pages/Wishlists'
import { BookingSuccess } from './pages/BookingSuccess'
import { NotFound } from './pages/NotFound'

export default function App() {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/wishlists" element={<Wishlists />} />
          <Route path="/booking/success" element={<BookingSuccess />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}
