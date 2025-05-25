
import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
  } from "@/components/ui/dialog";

const CreateGroupModal = ({isOpen,onClose,onSuccess}) => {
  const handleClose = () => {




    onClose();
  };
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
        
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                    This action cannot be undone. This will permanently delete your account
                    and remove your data from our servers.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>Footer</DialogFooter>

        </DialogContent>
    </Dialog>

  );
};

export default CreateGroupModal;