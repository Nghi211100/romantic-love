export const Audio = () => {
  return (
    <div className="w-full pl-3">
      <p className="text-red-600 pb-1 text-xl font-bold">
        Bật nhạc nghe đã nha 💕:{" "}
      </p>{" "}
      <audio controls autoPlay={true} className="-ml-3">
        <source
          src="/sound/Beautiful-In-White-Shayne-Ward-Shayne-Ward.mp3"
          type="audio/mpeg"
        />
      </audio>
    </div>
  );
};
