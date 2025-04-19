import { LeoFiLogo } from "@/lib/leofi-logo";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <LeoFiLogo className="w-6 h-6 mr-2" />
            <span className="text-lg font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">LeoFi</span>
          </div>
          <div className="flex space-x-4 text-sm text-gray-600">
            <a href="/docs" className="hover:text-orange-500">Documentation</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500">GitHub</a>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500">Discord</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500">Twitter</a>
          </div>
          <div className="text-xs text-gray-500 mt-4 md:mt-0">
            © {new Date().getFullYear()} LeoFi. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
