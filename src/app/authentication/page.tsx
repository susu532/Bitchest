import Logo from '@/components/ui/logo';
import Image from '@/components/ui/image';
import SignInForm from '@/components/auth/sign-in-form';
import AnchorLink from '@/components/ui/links/anchor-link';
import routes from '@/config/routes';

// import images and icons
import BitcoinImg from '@/assets/images/bit-coin.png';
import GoogleIcon from '@/assets/images/google-icon.svg';

export default function SignIn() {
  return (
    <div className="grid flex-grow grid-cols-1 gap-0 lg:grid-cols-[1fr_40%] 3xl:grid-cols-2 bg-bitchest-white">
      <div className="flex flex-col items-center justify-center py-14">
        <div className="grid w-full max-w-[408px] grid-cols-1 gap-4 px-4 border border-bitchest-light-blue rounded-lg bg-bitchest-white">
          <div className="mx-auto mb-2 w-20 lg:ml-0 xl:w-24">
            <Logo className="!w-full" />
          </div>
          <div className="mb-5 text-center lg:text-left">
            <h2 className="mb-2 text-2xl font-bold text-bitchest-blue text-center uppercase">
              Welcome Back!
            </h2>
            <p className="text-base text-bitchest-light-blue text-center">
              Log in to your BitChest account
            </p>
          </div>
          <button className="flex w-full items-center justify-center gap-2.5 rounded-md border-2 border-bitchest-light-blue bg-bitchest-white py-2 text-base font-semibold text-bitchest-blue transition-all hover:bg-bitchest-green hover:text-bitchest-blue sm:rounded-lg sm:tracking-[0.04em]">
            <div className="relative h-5 w-5 sm:h-7 sm:w-7">
              <Image src={GoogleIcon} alt="google-icon" fill />
            </div>
            Log in with Google
          </button>
          <p className="flex items-center justify-center gap-3 text-sm text-bitchest-blue before:h-[1px] before:w-full before:border-t before:border-dashed after:h-[1px] after:w-full after:border-t after:border-dashed before:border-bitchest-light-blue after:border-bitchest-light-blue ">
            or
          </p>
          <SignInForm />
          <p className="text-sm tracking-[0.5px] text-bitchest-blue text-center">
            Not a member yet?
            <AnchorLink
              href={routes.signUp}
              className="ml-1 font-semibold underline text-bitchest-green hover:text-bitchest-light-blue"
            >
              Create an account
            </AnchorLink>
          </p>
        </div>
      </div>
      <div className="relative hidden bg-bitchest-light-blue/10 lg:block">
        <Image src={BitcoinImg} alt="sign-up" fill className="object-cover" />
      </div>
    </div>
  );
}
