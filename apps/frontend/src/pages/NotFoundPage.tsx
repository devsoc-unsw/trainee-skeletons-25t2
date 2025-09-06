import { useNavigate } from "react-router-dom";
// 404 Page
export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <>
      <div className="flex items-center justify-center w-full">
        <div className="bg-white text-black shadow-lg flex flex-col justify-center items-center rounded-2xl p-6 w-full max-w-lg space-y-6">
          <p className="text-8xl font-bold mb-4">404</p>
          <p className="text-xl mb-8">Page Not Found</p>
          <button onClick={() => navigate("/")}>Go Home</button>
        </div>
      </div>
    </>
  );
}
