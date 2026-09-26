import { Link } from "react-router-dom";

const AuthFooter = ({ children, to, linkText }) => (
  <p className="mt-6 text-center text-sm text-muted-foreground">
    {children}{" "}
    <Link
      to={to}
      className="font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {linkText}
    </Link>
  </p>
);
export default AuthFooter;
