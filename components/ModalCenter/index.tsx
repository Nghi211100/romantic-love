import React, { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import Modal from "../Modal";
import Image from "next/image";
import { DATE } from "@/utils/common";

export const ModalCenter = ({
  show,
  setShow,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
}) => {
  const content = useMemo(
    () =>
      `Gửi tới Em! một thiên thần nhỏ đước gửi xuống thế giới này 😍. Thời gian vừa qua mệt lắm có phải không? Nhưng không sao đâu nè, vẫn còn Anh ở đây, Anh sẽ trò chuyện với Em, làm Em vui vẻ hơn, kết thúc một ngày của Em với những nụ cười 😄. Hôm nay là ngày ${DATE}, chào mừng Em đến với cuộc sống hồn nhiên và đầy màu sắc này nhé. Anh mong Em luôn luôn vui vẻ và hạnh phúc 👩‍❤️‍👨, miệng cười hồn nhiên, hoa sẽ vì Em mà e thẹn, nắng sẽ vì Em mà lu mờ, không chúc em giàu sang, chỉ chúc em bớt đi những muộn phiền. Mong là chúng ta có thể đồng hành cùng nhau tiếp những chặng đường phía trước nhá👫, yêu em 🥰`,
    []
  );

  const [text, setText] = useState("");
  const [numb, setNumb] = useState(0);

  useEffect(() => {
    if (show) {
      setText("");
      setNumb(0);
    }
  }, [show]);

  useEffect(() => {
    if (!show) {
      return;
    }
    if (numb >= content.length) {
      return;
    }
    const timer = setTimeout(() => {
      setNumb((prev) => prev + 1);
      setText((prev) => prev + content.charAt(numb));
    }, 50);

    return () => clearTimeout(timer);
  }, [content, numb, show]);

  return (
    <Modal show={show} onCancel={() => setShow(false)}>
      <div className="h-[82vh] w-[calc(100vw-16px)] rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 p-3 text-rose-600 shadow-2xl md:h-[480px] md:w-[700px] md:p-4">
        <div className="h-full rounded-xl border border-dashed border-rose-200">
          <div className="w-full h-full rotate-[-10deg] rounded-lg bg-white -z-10 absolute inset-0"></div>
          <div className="flex h-full w-full flex-col md:flex-row">
            <div className="relative h-[32%] w-full md:-ml-10 md:h-full md:w-1/2">
              <div className="absolute inset-0 flex h-full w-full flex-row items-center justify-evenly md:top-10 md:flex-col">
                <div className="block md:hidden">
                  <Image
                    src={"/images/avatar.jpg"}
                    width={100}
                    height={100}
                    alt="heart"
                    loading="eager"
                    className="rounded-full"
                  />
                </div>
                <Image
                  src={"/images/heart_gift.png"}
                  width={600}
                  height={600}
                  alt="heart"
                  loading="eager"
                  className="h-[130px] w-[130px] object-contain md:h-auto md:w-auto"
                />
              </div>
            </div>
            <div className="h-[58%] w-full md:h-full md:w-1/2">
              <div className="h-full overflow-y-auto pr-1 pt-2 md:pt-4 md:pr-2">
                <span
                  className="text-base leading-relaxed md:text-xl"
                  id={"content"}
                >
                  {text}|
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
