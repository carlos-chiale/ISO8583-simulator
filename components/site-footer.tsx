import { Github } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t mt-8">
      <div className="container mx-auto px-4 py-6 text-sm text-gray-600 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="mr-2">Contact:</span>
          <a href="mailto:carlos@chiale.dev" className="text-blue-600 hover:underline">
            carlos@chiale.dev
          </a>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://carlos.chiale.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            carlos.chiale.dev
          </a>
          <a
            href="https://github.com/carlos-chiale"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline flex items-center gap-1"
          >
            <Github className="h-4 w-4" aria-hidden="true" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </footer>
  );
}


