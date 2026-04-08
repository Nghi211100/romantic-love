export const Audio = () => {
  return (
    <div className="w-full max-w-xl rounded-2xl border border-white/40 bg-white/70 p-3 shadow-lg backdrop-blur-sm md:px-5">
      <p className="pb-2 text-center text-lg font-bold text-rose-500 md:text-xl">
        Bật nhạc nghe đã nha 💕
      </p>
      <audio controls autoPlay={true} className="w-full">
        <source
          src="/sound/Beautiful-In-White-Shayne-Ward-Shayne-Ward.mp3"
          type="audio/mpeg"
        />
      </audio>
    </div>
  );
};
