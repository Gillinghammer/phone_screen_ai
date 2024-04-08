import { useState } from "react";

const CheckboxField = ({ label, name, checked, handleChange }) => (
  <div className="mb-4 flex items-center">
    <label htmlFor={name} className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          id={name}
          name={name}
          checked={checked}
          onChange={handleChange}
          className="sr-only" // Hide the default checkbox
        />
        <div
          className={`block bg-gray-200 w-14 h-8 rounded-full ${
            checked ? "bg-green-400" : "bg-gray-200"
          }`}
        ></div>
        <div
          className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
            checked ? "translate-x-full" : ""
          }`}
        ></div>
      </div>
      <span className="ml-3 text-sm">{label}</span>
    </label>
  </div>
);

const ConfirmationModal = ({ company, isOpen, onClose, onConfirm }) => {
  const checkboxes = [
    {
      name: "phoneCall",
      label: "I'm ready for a call within 30 seconds of applying.",
    },
    {
      name: "quietPlace",
      label: "I'm in a quiet place for a 15-minute phone call.",
    },
    {
      name: "recordingConsent",
      label: "I consent to recording and analysis of the call.",
    },
    {
      name: "aiAgent",
      label: "I understand the call is by an AI agent, not a human.",
    },
    {
      name: "softwarePowered",
      label: `I understand the AI agent represents software, not ${company}.`,
    },
    {
      name: "noGuarantee",
      label: `I understand completing the screen doesn't guarantee human follow-up from ${company}.`,
    },
  ];

  const [checkedState, setCheckedState] = useState(
    checkboxes.reduce(
      (acc, checkbox) => ({ ...acc, [checkbox.name]: false }),
      {}
    )
  );

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setCheckedState({ ...checkedState, [name]: checked });
  };

  const allChecked = Object.values(checkedState).every(Boolean);

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 ${
        isOpen ? "block" : "hidden"
      }`}
    >
      <div className="bg-white text-gray-900 rounded-lg shadow-xl p-6 w-full max-w-xl">
        <h2 className="text-xl font-bold mb-4">Please Confirm</h2>
        <div className="space-y-2">
          {checkboxes.map(({ name, label }) => (
            <CheckboxField
              key={name}
              label={label}
              name={name}
              checked={checkedState[name]}
              handleChange={handleCheckboxChange}
            />
          ))}
        </div>
        <div className="flex justify-end mt-4 space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            No thanks
          </button>
          <button
            onClick={onConfirm}
            disabled={!allChecked}
            className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              allChecked ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            Ready for my phone screen!
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
