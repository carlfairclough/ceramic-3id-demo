"use client";

import { useCallback, useEffect, useState } from "react";

// UI & Styling
import {
  Box,
  Button,
  ButtonProps,
  Card,
  ChakraProps,
  FormLabel,
  Heading,
  IconButton,
  Input,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { atomOneDark } from "react-syntax-highlighter/dist/cjs/styles/hljs";
import SyntaxHighlighter from "react-syntax-highlighter";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";

// Ceramic imports
import { getSeed } from "../utils/getSeed";
import { connect3ID } from "../utils/connect";
import { useAccount } from "wagmi";
import { NextPage } from "next";
import Head from "next/head";
import { deflate } from "zlib";

const Home: NextPage = () => {
  // Wallet
  const { connector, address, isConnected } = useAccount();
  // Ceramic
  const [seed, setSeed] = useState("");
  const [did, setDid] = useState<{ [key: string]: any } | undefined>({});

  const { openConnectModal } = useConnectModal();

  const generateSeed = useCallback(async () => {
    const provider = await connector?.getProvider();
    if (address && provider) {
      const seed = await getSeed(address, provider);
      setSeed(seed);
    }
  }, [connector, address]);

  const generateDid = useCallback(async () => {
    if (seed && address) {
      setIsLoading(true)
      const summary = await connect3ID(seed, address);
      setDid(summary);
      setIsLoading(false)
    }
  }, [address, seed]);

  const defaultProps = {
    disabled: true,
    _hover: {},
    cursor: "not-allowed",
    colorScheme: "blackAlpha",
  };
  const enabledProps = {
    colorScheme: "orange",
  };
  const [buttonProps, setButtonProps] = useState<ButtonProps>(defaultProps);

  const [button1Props, setButton1Props] = useState<ButtonProps>(defaultProps);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const enabled = !!seed && !!address;
    if (address) {
      setButton1Props(enabledProps);
    } else {
      setButton1Props(defaultProps);
    }
    if (enabled) {
      setButtonProps(enabledProps);
    } else {
      setButtonProps(defaultProps);
    }
  }, [seed, address]);

  return (
    <Box width="full" maxWidth={780} mr="auto" ml="auto" mt={5}>
      <Head>
        <title>DID Generator</title>
        <link href="/favicon.ico" rel="icon" />
      </Head>
      <Box p={5}>
        <Heading mb={5}>Did Generator</Heading>
        <Text>
          This tool helps you to first enter, or generate, a seed, before using
          it to create a DID using tools provided by Ceramic.
        </Text>
      </Box>

      <Card variant={"elevated"} p={5} my={5}>
        <Box display="flex" justifyContent={"space-between"} mb={3}>
          <Heading size="md" alignItems={"center"}>
            <span style={{ opacity: 0.5 }}>Step 1: </span>
            Generate seed using wallet
          </Heading>
        </Box>
        <Text>Sign a message to generate a seed using your wallet.</Text>
        <Text>Using the same seed should generate the same DID.</Text>
        <Box
          display="flex"
          mt={5}
          flexDirection={{ base: "column", md: "row" }}
        >
          <ConnectButton />
          <Button
            ml={{ base: 0, md: 3 }}
            mt={{ base: isConnected ? 3 : 0, md: 0 }}
            minWidth={"max-content"}
            {...button1Props}
            onClick={isConnected ? generateSeed : openConnectModal}
          >
            Generate Seed
          </Button>
        </Box>
      </Card>

      <Card variant={"elevated"} p={5} my={5}>
        <Heading size="md" alignItems={"center"} mb={3}>
          <span style={{ opacity: 0.5 }}>Step 2: </span>Generate DID using
          generated secrets
        </Heading>
        <Box mb={3}>
          <FormLabel width="full" mt={2}>
            AuthId. Typically the address.
          </FormLabel>
          <Input
            placeholder={"Waiting for wallet connection"}
            fontFamily={"SFMono-Regular,Menlo,Monaco,Consolas,monospace"}
            fontSize={14}
            value={address || ""}
            width="full"
            disabled
          />
          <FormLabel width="full" mt={2}>
            Authsecret. Generated using signed message.
          </FormLabel>
          <Textarea
            fontFamily={"SFMono-Regular,Menlo,Monaco,Consolas,monospace"}
            fontSize={14}
            width="full"
            value={seed}
            placeholder="Awaiting signed messeage"
            disabled
          />

          <Button {...buttonProps} onClick={generateDid} mt={3} mb={3}>
            {isLoading ? "Loading" : "Generate did"}
          </Button>
        </Box>
        <Text my={3}>The same seed should output the same DID.</Text>
        <SyntaxHighlighter
          language="javascript"
          style={atomOneDark}
          customStyle={{ fontSize: "14px", borderRadius: "8px" }}
        >
          {isLoading
            ? "Loading..."
            : did
            ? JSON.stringify(did, null, 4)
            : "Did not generated"}
        </SyntaxHighlighter>
      </Card>
    </Box>
  );
};

export default Home;
