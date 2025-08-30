import './joinRoomPage.css';

const joinRoomPage = () => {
  return (
    <div className="w-[795px] h-[597px] bg-white rounded-3xl border-[1.3px] border-[#A5D6FF] flex flex-col gap-[54px] items-center justify-center">
      <div className="w-[546px] h-[178px]flex flex-col gap-[12px] items-center justify-center">
        <h1 className="text-[53.79] text-black font-bold text-center">Welcome to Joe's Room</h1>
        <h2 className="text-[18] text-black italic text-center">Type in your name to join the room and start voting!</h2>
      </div>

      <div className="flex flex-col gap-[8px] items-start justify-start w-[546px] h-[75px]">
        <p className="text-[16] text-[#111827]">Name</p>
        <input
            type="text"
            placeholder="Enter your name"
            className="border-[#F2F9FF] border-[1px] rounded-[8px] text-[#111827] placeholder:text-[#005BAB] 
            placeholder:opacity-20 w-[546px] h-[43px] text-[16px] pl-[15px] py-[12px] focus:outline-none"
        />
      </div>

      <div>
        <button className="w-[546px] h-[48px] bg-[#005BAB] rounded-[8px] text-white text-[16px] font-medium focus:outline-none">
            Join Room
        </button>
      </div>
    </div>
  );
}

export default joinRoomPage;