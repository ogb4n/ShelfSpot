import { Chip } from "@mui/joy";

interface TagProps {
  label: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}
export const Tag: React.FC<TagProps> = ({ label, icon, children }) => {
  return (
    <Chip color="success" variant="outlined" startDecorator={icon}>
      {label}
      {children}
    </Chip>
  );
};
