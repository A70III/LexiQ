import { HiOutlineSpeakerWave, HiOutlineBookOpen, HiOutlinePencilSquare, HiOutlineMicrophone } from "react-icons/hi2";

export const SKILL_ICONS: Record<string, React.ReactNode> = {
  listening: <HiOutlineSpeakerWave style={{ width: 16, height: 16 }} />,
  reading: <HiOutlineBookOpen style={{ width: 16, height: 16 }} />,
  writing: <HiOutlinePencilSquare style={{ width: 16, height: 16 }} />,
  speaking: <HiOutlineMicrophone style={{ width: 16, height: 16 }} />,
};
