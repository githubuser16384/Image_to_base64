import { useState, useRef } from "react";

function ImageToBase64() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [base64Data, setBase64Data] = useState("");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    processFile(selectedFile);
  };

  const processFile = (selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setFile(selectedFile);
      setStatusMessage(
        `File "${selectedFile.name}" selected (${(
          selectedFile.size / 1024
        ).toFixed(1)} KB)`,
      );
      setBase64Data("");
      setCopied(false);
    } else if (selectedFile) {
      setStatusMessage(
        "Error: Please select an image file (PNG, JPG, JPEG, GIF, BMP, etc.)",
      );
      setTimeout(() => setStatusMessage(""), 3000);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const related = e.relatedTarget || e.toElement || null;
    if (!dropAreaRef.current) {
      setIsDragging(false);
      return;
    }
    if (!related || !dropAreaRef.current.contains(related)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (
      e.dataTransfer &&
      e.dataTransfer.files &&
      e.dataTransfer.files.length > 0
    ) {
      processFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleAreaClick = (e) => {
    if (
      e.target.tagName.toLowerCase() !== "label" &&
      !e.target.closest("label")
    ) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setStatusMessage("Please select a file first");
      setTimeout(() => setStatusMessage(""), 3000);
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/convertBase64`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (response.ok) {
        const result = await response.text();
        const dataUri = `data:${result}`;
        setBase64Data(dataUri);
        setStatusMessage("Success! Base64 encoding complete. You can now copy it.");
        setTimeout(() => setStatusMessage(""), 5000);
      } else {
        const error = await response.json();
        setStatusMessage(`Error: ${error.error || "Conversion failed"}`);
        setTimeout(() => setStatusMessage(""), 5000);
      }
    } catch (error) {
      setStatusMessage(`Error: ${error.message || "Failed to convert file"}`);
      setTimeout(() => setStatusMessage(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (base64Data) {
      navigator.clipboard.writeText(base64Data).then(() => {
        setCopied(true);
        setStatusMessage("Data URI copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
        setTimeout(() => setStatusMessage(""), 3000);
      });
    }
  };

  return (
    <div className="w-full max-w-[600px] mx-auto p-10 text-center flex flex-col justify-center items-center bg-gradient-to-br from-[#f6f8fa] to-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-hidden">
      <h1 className="mb-10 text-[#1a1a2e] text-5xl font-bold tracking-tight relative inline-block after:content-[''] after:absolute after:w-[60px] after:h-1 after:bg-gradient-to-r after:from-[#4361ee] after:to-[#7209b7] after:-bottom-2.5 after:left-1/2 after:-translate-x-1/2 after:rounded-sm">
        Image to Base64
      </h1>
      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col items-center"
      >
        <div
          ref={dropAreaRef}
          className={`w-full border-2 border-dashed rounded-2xl p-8 mb-8 cursor-pointer transition-all duration-300 flex flex-col items-center select-none ${
            isDragging
              ? "border-[#3b82f6] bg-[#ebf5ff] scale-[1.02]"
              : "border-[#c7d2fe] bg-[rgba(239,246,255,0.6)] hover:border-[#4361ee] hover:-translate-y-1 hover:shadow-[0_8px_15px_rgba(67,97,238,0.1)] hover:bg-[rgba(229,240,255,0.8)] active:translate-y-0 active:shadow-[0_4px_8px_rgba(67,97,238,0.08)] active:bg-[rgba(219,234,254,0.9)]"
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleAreaClick}
        >
          <div className="text-[2.5rem] text-[#4361ee] mb-4">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="2"
                ry="2"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle
                cx="8.5"
                cy="8.5"
                r="1.5"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            id="image-input"
            ref={fileInputRef}
            className="hidden"
          />
          <label
            htmlFor="image-input"
            className="flex flex-col items-center text-xl text-[#4b5563] cursor-pointer font-medium transition-colors duration-200 hover:text-[#1a1a2e]"
          >
            {file ? (
              <div
                className="bg-[#f0f9ff] px-4 py-2 rounded-lg mt-3 text-[#0369a1] font-semibold shadow-[0_2px_5px_rgba(0,0,0,0.05)] border-l-[3px] border-[#0ea5e9] max-w-full overflow-hidden text-ellipsis whitespace-nowrap break-all"
                title={file.name}
              >
                {file.name.length > 25
                  ? `${file.name.substring(0, 22)}...`
                  : file.name}
              </div>
            ) : (
              <>
                Choose image file or drag & drop here
                <div className="text-[0.95rem] text-[#6b7280] mt-3">
                  Supports PNG, JPG, JPEG, GIF, BMP, and more
                </div>
              </>
            )}
          </label>
        </div>
        <button
          type="submit"
          disabled={!file || loading}
          className="bg-gradient-to-r from-[#4361ee] to-[#3b82f6] text-white py-3.5 px-8 border-none rounded-lg cursor-pointer text-lg font-semibold transition-all duration-300 shadow-[0_4px_12px_rgba(59,130,246,0.25)] tracking-wide relative overflow-hidden w-full max-w-[300px] mx-auto hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_6px_16px_rgba(59,130,246,0.35)] active:enabled:translate-y-0.5 active:enabled:shadow-[0_2px_8px_rgba(59,130,246,0.2)] disabled:bg-gradient-to-r disabled:from-[#cbd5e1] disabled:to-[#e2e8f0] disabled:text-[#94a3b8] disabled:cursor-not-allowed disabled:shadow-none"
        >
          {loading ? (
            <>
              <span className="inline-block w-5 h-5 border-[3px] border-[rgba(255,255,255,0.3)] rounded-full border-t-white animate-spin mr-2.5"></span>
              Encoding...
            </>
          ) : (
            "Encode to Base64"
          )}
        </button>
        {base64Data && (
          <div className="w-full mt-8 flex flex-col items-center gap-4">
            <div className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-6">
              <p className="text-sm text-[#64748b] font-semibold mb-3">
                Data URI (Base64):
              </p>
              <div className="bg-white border border-[#cbd5e1] rounded-lg p-4 text-left overflow-auto max-h-[200px] font-mono text-sm text-[#334155] break-all">
                {base64Data.substring(0, 100)}...
              </div>
              <p className="text-xs text-[#94a3b8] mt-2">
                Total length: {base64Data.length} characters
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className={`py-3 px-8 border-none rounded-lg cursor-pointer text-lg font-semibold transition-all duration-300 tracking-wide relative overflow-hidden w-full max-w-[300px] mx-auto ${
                copied
                  ? "bg-gradient-to-r from-[#10b981] to-[#059669] text-white shadow-[0_4px_12px_rgba(16,185,129,0.25)] hover:shadow-[0_6px_16px_rgba(16,185,129,0.35)]"
                  : "bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white shadow-[0_4px_12px_rgba(124,58,237,0.25)] hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(124,58,237,0.35)] active:translate-y-0.5 active:shadow-[0_2px_8px_rgba(124,58,237,0.2)]"
              }`}
            >
              {copied ? (
                <>
                  <span className="inline-block w-5 h-5 mr-2.5">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </span>
                  Copied!
                </>
              ) : (
                <>
                  <span className="inline-block w-5 h-5 mr-2.5">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                    </svg>
                  </span>
                  Copy Data URI
                </>
              )}
            </button>
          </div>
        )}
        {statusMessage && (
          <p className="mt-6 text-[0.95rem] text-[#4b5563]">{statusMessage}</p>
        )}
      </form>
    </div>
  );
}

export default ImageToBase64;
