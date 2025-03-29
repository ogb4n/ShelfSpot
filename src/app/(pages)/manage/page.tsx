"use server";
import { Manager } from "@/app/components/Manager";
import { Box } from "@mui/joy";

/**
 * Manage Page Component
 *
 * @returns {JSX.Element} Rendered page component
 */
const ManagePage = () => {
  return (
    <main className="p-8">
      <Box className="container mx-auto">
        <Manager />
      </Box>
    </main>
  );
};

export default ManagePage;
