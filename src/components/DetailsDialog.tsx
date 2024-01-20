import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';

// Importa i componenti necessari se li vuoi utilizzare
// import { Github, HelpCircle, Youtube } from 'lucide-react';
// import Link from 'next/link';
// import Image from 'next/image';

type Props = {};

const DetailsDialog = (props: Props) => {
  return (
    <Dialog>
      <DialogTrigger>
        <span className="flex items-center px-2 py-1 text-white rounded-md bg-slate-800">
          What is this
        </span>
      </DialogTrigger>
      <DialogContent className="w-[70vw] max-w-[100vw] md:w-[50vw]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Welcome to Quizmefy!</DialogTitle>
          <DialogDescription>
            {/* <div className="flex items-center gap-3 my-2">
              <p className="flex items-center">
                <Github className="w-5 h-5" />
                <Link href="https://github.com/your-github-link">
                  GitHub
                </Link>
              </p>
              <p className="flex items-center">
                <Youtube className="w-5 h-5" />
                <Link href="https://youtube.com/your-youtube-link">
                  YouTube
                </Link>
              </p>
            </div> */}
            <p className="my-2 mt-4">
            Sei stanco di quiz banali e ripetitivi? Dì addio all'ordinario e abbraccia lo straordinario con Clarity Quiz! La nostra piattaforma sta rivoluzionando l'esperienza dei quiz sfruttando l'immenso potenziale dell'intelligenza artificiale.
            </p>
            <hr />
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default DetailsDialog;
