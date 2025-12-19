const UserAvatar = ({ firstName, lastName, size = "md" }) => {
  // Générer initiales
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  
  // Tailles
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-xl",
    xl: "w-24 h-24 text-3xl"
  };

  // Couleurs aléatoires stylées (basées sur la première lettre)
  const colors = [
    "bg-red-100 text-red-600", "bg-green-100 text-green-600", 
    "bg-blue-100 text-blue-600", "bg-purple-100 text-purple-600", 
    "bg-yellow-100 text-yellow-600", "bg-pink-100 text-pink-600"
  ];
  // Astuce pour avoir toujours la même couleur pour le même nom
  const charCode = firstName ? firstName.charCodeAt(0) : 0;
  const colorClass = colors[charCode % colors.length];

  return (
    <div className={`${sizeClasses[size]} ${colorClass} rounded-full flex items-center justify-center font-bold shadow-sm border border-white`}>
      {initials}
    </div>
  );
};

export default UserAvatar;