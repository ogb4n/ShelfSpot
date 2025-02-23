import { type IconName } from "lucide-react/dynamic";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import DeleteForever from "@mui/icons-material/DeleteForever";
import InventoryIcon from "@mui/icons-material/Inventory";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import GradeIcon from "@mui/icons-material/Grade";

import { LuCodepen } from "react-icons/lu";
export const availableIcons: readonly IconName[] = [
  "home",
  "user",
  "settings",
  "camera",
  "house",
  "warehouse",
  "cctv",
  "eye",
  "eye-off",
  "factory",
  "wallet",
  "boxes",
  "computer",
  "keyboard",
] as const;

export {
  DeleteOutlineIcon,
  SearchRoundedIcon,
  SettingsRoundedIcon,
  LogoutRoundedIcon,
  LuCodepen,
  EditIcon,
  DeleteIcon,
  SaveIcon,
  CancelIcon,
  DeleteForever,
  InventoryIcon,
  GradeIcon,
};
