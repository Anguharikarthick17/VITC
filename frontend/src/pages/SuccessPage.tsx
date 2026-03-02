import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Search, Home as HomeIcon, Copy } from 'lucide-react';

const SuccessPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [copied, setCopied] = React.useState(false);

    const copyId = () => {
        if (id) {
            navigator.clipboard.writeText(id);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center px-4">
            <div className="card p-10 max-w-lg w-full text-center space-y-6">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34, 197, 94,0.3)]">
                    <CheckCircle className="w-12 h-12 text-green-400" />
                </div>

                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Complaint Submitted!</h1>
                    <p className="text-gray-400 mb-8">
                        Your complaint has been successfully registered and assigned to the nearest available team.
                    </p>
                </div>

                <div className="bg-[#1A1A2E] border border-[#2A2A4A] rounded-2xl p-6 mb-8 text-left shadow-sm">
                    <p className="text-sm text-gray-400 mb-2">Your Tracking ID</p>
                    <div className="flex items-center justify-between bg-[#0F0F1A] border border-[#2A2A4A] rounded-lg px-4 py-3">
                        <span className="font-mono text-lg text-cyan-400 font-bold">{id}</span>
                        <Copy className="w-5 h-5 text-gray-500 cursor-pointer hover:text-white transition-colors" onClick={copyId} />
                    </div>
                    {copied && <p className="text-green-400 text-xs mt-2 text-center">Copied to clipboard!</p>}
                    <p className="text-xs text-gray-500 mt-3 flex items-start gap-1">
                        <span className="text-cyan-500 mt-0.5">ℹ</span>
                        Please save this ID to track your complaint status on the public portal.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <Link to={`/track?id=${id}`} className="btn-primary flex-1 flex items-center justify-center gap-2">
                        <Search className="w-4 h-4" /> Track Complaint
                    </Link>
                    <Link to="/" className="btn-secondary flex-1 flex items-center justify-center gap-2">
                        <HomeIcon className="w-4 h-4" /> Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SuccessPage;
