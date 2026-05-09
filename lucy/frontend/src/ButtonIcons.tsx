import { BsArrowLeftShort, BsChevronLeft, BsChevronRight, BsFile, BsFolder, BsGear, BsPlay, BsPlusLg, BsTrash, BsUpload, BsX, BsSkipBackwardFill, BsSkipForwardFill } from 'react-icons/bs'
import { FaArrowCircleLeft, FaArrowCircleRight, FaRegSave, FaSave } from 'react-icons/fa'
import { FaRegCopy } from 'react-icons/fa6'

const size = 18

export const ButtonIcons = {
    back: <BsArrowLeftShort size={size} />,
    goLeft: <BsChevronLeft size={size} />,
    goRight: <BsChevronRight size={size} />,
    faRegCopy: <FaRegCopy size={16} />,
    file: <BsFile size={size} />,
    folder: <BsFolder size={size} />,
    gear: <BsGear size={size} />,
    next: <FaArrowCircleRight size={size} />,
    play: <BsPlay size={size} />,
    plus: <BsPlusLg size={16} />,
    previous: <FaArrowCircleLeft size={size} />,
    trash: <BsTrash size={size} />,
    upload: <BsUpload size={14} />,
    x: <BsX size={20} />,
    close: <BsX size={20} />,
    save: <FaRegSave size={size} />,
    saveAs: <FaSave size={size} />,
    skipBackward: <BsSkipBackwardFill size={size} />,
    skipForward: <BsSkipForwardFill size={size} />,
}
