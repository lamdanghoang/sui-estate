"use client";
import Header from "./Header";
// import Footer from "./Footer";
import {
  createNetworkConfig,
  SuiClientProvider,
  WalletProvider,
} from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "../ui/sonner";
// import { customTheme } from "../wallet/customTheme";

// Config options for the networks you want to connect to
const { networkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl("testnet") },
  mainnet: { url: getFullnodeUrl("mainnet") },
});
const queryClient = new QueryClient();

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          {/* <div className="flex flex-col min-h-screen items-center"> */}
          <Header />
          <main className="flex-1">{children}</main>
          <Toaster />
          {/* <Footer /> */}
          {/* </div> */}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
};

export default Layout;
