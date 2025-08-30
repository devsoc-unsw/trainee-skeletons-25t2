import { Link } from "react-router-dom";
// 404 Page
export default function NotFoundPage() {
  return (
    <>
      <p className="text-8xl font-bold mb-4">404</p>
      <p className="text-xl mb-8">Page Not Found</p>
      <Link
        to="/"
        className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition-colors"
      >
        Go Home
      </Link>
    </>
  );
}
