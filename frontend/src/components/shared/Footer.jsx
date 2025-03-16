const Footer = () => {
  return (
    <footer className='bg-pickle-green text-white p-4 mt-auto'>
      <div className='container mx-auto text-center'>
        <p>
          &copy; {new Date().getFullYear()} Picklebookie. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
