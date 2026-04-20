import { useState } from "react";
import { Phone, ShieldAlert, X } from "lucide-react";

export default function EmergencyOverlay() {
  const [isOpen, setIsOpen] = useState(false);

  const handleQuickExit = () => {
    // Immediately redirect the tab and overwrite history so back button won't return
    window.location.replace("https://www.google.com");
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 hover:scale-105 transition-all duration-200"
        title="Emergency Help"
      >
        <ShieldAlert size={28} />
      </button>

      {/* Emergency Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 text-center">
            
            {/* Header */}
            <div className="bg-red-50 text-red-600 p-5 border-b border-red-100 flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShieldAlert size={24} /> Emergency Help
              </h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-red-400 hover:text-red-700 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              <div>
                <p className="text-sm font-medium text-zinc-500 mb-2">National Crisis Helplines (India)</p>
                
                <a href="tel:9152987821" className="flex items-center justify-between p-4 bg-surface-50 border border-surface-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition w-full group mb-3">
                  <div className="text-left">
                    <p className="font-bold text-zinc-800 group-hover:text-red-800">iCall (TISS)</p>
                    <p className="text-xs text-zinc-500">Mon-Sat, 10am-8pm</p>
                  </div>
                  <div className="flex items-center gap-2 text-red-600 font-bold bg-white px-3 py-1.5 rounded-lg shadow-sm border border-red-100">
                    <Phone size={16} /> 9152987821
                  </div>
                </a>

                <a href="tel:18602662345" className="flex items-center justify-between p-4 bg-surface-50 border border-surface-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition w-full group">
                  <div className="text-left">
                    <p className="font-bold text-zinc-800 group-hover:text-red-800">Vandrevala Foundation</p>
                    <p className="text-xs text-zinc-500">24/7 Helpline</p>
                  </div>
                  <div className="flex items-center gap-2 text-red-600 font-bold bg-white px-3 py-1.5 rounded-lg shadow-sm border border-red-100">
                    <Phone size={16} /> 1860-2662-345
                  </div>
                </a>
              </div>

              <div className="pt-2">
                <button 
                  onClick={handleQuickExit}
                  className="w-full py-3.5 bg-zinc-900 text-white font-bold rounded-xl shadow-md hover:bg-black transition flex items-center justify-center gap-2"
                >
                  Quick Exit to Google
                </button>
                <p className="text-[10px] text-zinc-400 mt-2">
                  Clicking this will instantly redirect you to Google.com and hide this page.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
