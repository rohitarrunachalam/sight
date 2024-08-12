import Link from 'next/link'

interface StorePageProps {
  params: {
    id: string;
  };
}

export default function StorePage({ params }: StorePageProps) {
  const { id } = params

  return (
    <div className='p-10'>
     <h1 className="text-2xl font-bold mb-5">Store {id}</h1>
      <p className="mb-5">This is where you'd display individual store data and forecasts.</p>
      <Link href="/forecasts" className="text-blue-500 hover:underline">Back to Map</Link>
    </div>
  )
}