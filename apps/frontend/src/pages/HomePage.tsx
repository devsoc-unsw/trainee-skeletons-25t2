import "./Pages.css";

export default function HomePage() {
  return (
    <div className="flex items-center justify-center">
      <div className="w-[520px] h-[560px] bg-gray-300/50 rounded-lg flex items-end justify-center p-8">
        <div className="w-[456px] h-[440px] bg-gray-100 rounded-lg flex flex-col items-center justify-start p-2 gap-4">
          <img
            src='nomnomvotes_logo.png'
            alt='cookie'
            className="w-40 h-40 object-contain"
          />

          <div className="w-[400px] h-[32px] flex items-center justify-center px-2 gap-8">
            <div className='w-[180px] h-[32px] bg-gray-300 rounded-lg'>
              <p className="text-gray-900 text-center">Host Game</p>
            </div>
            <div className='w-[180px] h-[32px] bg-gray-300 rounded-lg'>
              <p className='text-gray-900 text-center'>Join Game</p>
            </div>
          </div>

          <div className="w-[400px] flex flex-col gap-1">
            <i className="text-gray-900 text-left">Your name</i>
            <div className="h-[32px] border border-blue-200 rounded-lg">
              <p className="text-blue-200 px-[8px]">Enter name</p>
            </div>

            <i className="text-gray-900 text-left">Start time</i>
            <div className="h-[32px] border border-blue-200 rounded-lg">
              <p className="text-blue-200 px-[8px]">Enter name</p>
            </div>
          </div>

          <div className='w-[400px] h-[40px] bg-indigo-400 rounded-lg text-center'>
            <p>Create Game</p>
          </div>
        </div>
      </div>
    </div>
  );
}
