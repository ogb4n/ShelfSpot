"use client";

import * as React from "react";
import Button from "@mui/joy/Button";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import Typography from "@mui/joy/Typography";
import Sheet from "@mui/joy/Sheet";
import { SxProps } from "@mui/material";

interface BasicModalProps {
  openLabel: string | React.ReactNode;
  modalTitle: string;
  sx?: SxProps;
  modalLabel: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const BasicModal: React.FC<BasicModalProps> = ({
  openLabel,
  modalLabel,
  icon,
  modalTitle,
  sx,
  children,
}) => {
  const [open, setOpen] = React.useState<boolean>(false);
  return (
    <React.Fragment>
      <Button variant="outlined" sx={sx} onClick={() => setOpen(true)}>
        {icon} {openLabel}
      </Button>
      <Modal
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        open={open}
        onClose={() => setOpen(false)}
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <Sheet
          variant="outlined"
          sx={{ maxWidth: 500, borderRadius: "md", p: 3, boxShadow: "lg" }}
        >
          <ModalClose variant="plain" sx={{ m: 1 }} />
          <Typography
            component="h2"
            id="modal-title"
            level="h4"
            textColor="inherit"
            sx={{ fontWeight: "lg", mb: 1 }}
          >
            {modalTitle}
          </Typography>
          <Typography
            id="modal-desc"
            level="body-md"
            fontWeight="bold"
            textColor="text.tertiary"
          >
            {modalLabel}
          </Typography>

          {children}
        </Sheet>
      </Modal>
    </React.Fragment>
  );
};
