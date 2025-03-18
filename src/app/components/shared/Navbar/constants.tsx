import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

export const tabs = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: () => <DashboardRoundedIcon />,
  },
  {
    label: "Favourites",
    href: "/favourites",
    icon: () => <StarRoundedIcon />,
  },
  {
    label: "Consumables",
    href: "/consumables",
    icon: () => <LocalShippingRoundedIcon />,
  },
  // {
  //   label: "Accounting",
  //   href: "/accounting",
  //   icon: () => <AccountBalanceWalletIcon />,
  // },
];
