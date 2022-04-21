import { ReactComponent as Icon } from '../../assets/sun.svg';
export const Header = () => {
  return (
    <div className="header">
      <p className="header-text">Lunch time menu</p>
      <Icon className="dish-header-icon" />
      <p className="header-text">Daily</p>
    </div>
  );
};
