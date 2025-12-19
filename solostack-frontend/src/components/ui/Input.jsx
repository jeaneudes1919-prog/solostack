import { motion } from 'framer-motion';

const Input = ({ label, type, name, value, onChange, placeholder, required = true }) => {
  return (
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-semibold mb-2">{label}</label>
      <motion.input
        whileFocus={{ scale: 1.02, borderColor: '#0ea5e9' }} // Animation focus
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all duration-200"
      />
    </div>
  );
};

export default Input;