"use client";

import { useCallback, useState } from "react";

// UI & Styling
import {
  Box,
  Button,
  Card,
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

const Home: NextPage = () => {
  // Wallet
  const { connector, address, isConnected } = useAccount();
  // Ceramic
  const [seed, setSeed] = useState(
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
  );
  const [did, setDid] = useState<{ [key: string]: any } | undefined>({});
  // UI
  const [isGenerateSeedVisible, setIsGenerateSeedVisible] = useState(false);
  const [authId, setAuthId] = useState<string | undefined>();

  const { openConnectModal } = useConnectModal();

  const generateSeed = useCallback(async () => {
    const provider = await connector?.getProvider();
    if (address && provider) {
      const seed = await getSeed(address, provider);
      setSeed(seed);
    }
  }, [connector, address]);

  const generateDid = async (seed: string, authId?: string) => {
    const summary = await connect3ID(seed, authId);
    setDid(summary);
  };

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
        <Box
          display="flex"
          justifyContent={"space-between"}
          mb={isGenerateSeedVisible ? 3 : 0}
        >
          <Heading size="md" alignItems={"center"}>
            Generate seed using wallet{" "}
            <span style={{ opacity: 0.5 }}>(Optional)</span>
          </Heading>
          <IconButton
            aria-label="open/close generate seed panel"
            onClick={() => setIsGenerateSeedVisible(!isGenerateSeedVisible)}
            icon={
              isGenerateSeedVisible ? <ChevronUpIcon /> : <ChevronDownIcon />
            }
          ></IconButton>
        </Box>
        {isGenerateSeedVisible && (
          <>
            <Text>Sign a message to generate a seed using your wallet.</Text>
            <Text>Using the same seed should generate the same DID.</Text>
            <Box
              display="flex"
              mt={5}
              flexDirection={{ base: "column", md: "row" }}
            >
              {isConnected && <ConnectButton />}
              <Button
                ml={{ base: 0, md: isConnected ? 3 : 0 }}
                mt={{ base: isConnected ? 3 : 0, md: 0 }}
                minWidth={"max-content"}
                colorScheme={"orange"}
                onClick={isConnected ? generateSeed : openConnectModal}
                disabled={!isConnected}
              >
                {!isConnected
                  ? "Connect wallet to generate seed"
                  : "Generate seed"}
              </Button>
            </Box>
          </>
        )}
      </Card>

      <Card variant={"elevated"} p={5} my={5}>
        <Heading size="md" alignItems={"center"} mb={3}>
          Generate DID using seed
        </Heading>
        <Box mb={3}>
          <FormLabel width="full" mt={2}>
            Your seed. Will be used as AuthSecret if AuthId is provided.
          </FormLabel>
          <Textarea
            fontFamily={"SFMono-Regular,Menlo,Monaco,Consolas,monospace"}
            fontSize={14}
            width="full"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
          />
          <FormLabel width="full" mt={2}>
            Optional: use AuthId
          </FormLabel>
          <Input
            fontFamily={"SFMono-Regular,Menlo,Monaco,Consolas,monospace"}
            fontSize={14}
            value={authId}
            width="full"
            onChange={(e) => setAuthId(e.target.value)}
          />
          <Button
            colorScheme="orange"
            onClick={() => generateDid(seed, authId ? authId : undefined)}
            mt={3 }
            mb={3}
          >
            Generate did
          </Button>
        </Box>
        <Text my={3}>The same seed should output the same DID.</Text>
        <SyntaxHighlighter
          language="javascript"
          style={atomOneDark}
          customStyle={{ fontSize: "14px", borderRadius: "8px" }}
        >
          {did ? JSON.stringify(did, null, 4) : "Did not generated"}
        </SyntaxHighlighter>
      </Card>
    </Box>
  );
};

export default Home;
