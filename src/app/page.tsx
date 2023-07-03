"use client";

import { useCallback, useState } from "react";

// UI & Styling
import {
  Box,
  Button,
  Card,
  Heading,
  IconButton,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import SyntaxHighlighter from "react-syntax-highlighter";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Providers } from "@/components/Providers";

// Ceramic imports
import { getSeed } from "@/utils/getSeed";
import { connect3ID } from "@/utils/connect";
import { useAccount } from "wagmi";

export default function Home() {
  // Wallet
  const { connector, address, isConnected } = useAccount();
  // Ceramic
  const [seed, setSeed] = useState(
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
  );
  const [did, setDid] = useState<{ [key: string]: any } | undefined>({});
  // UI
  const [isGenerateSeedVisible, setIsGenerateSeedVisible] = useState(false);

  const generateSeed = useCallback(async () => {
    const provider = await connector?.getProvider();
    if (address && provider) {
      const seed = await getSeed(address, provider);
      setSeed(seed);
    }
  }, [connector, address]);

  const generateDid = async (seed: string) => {
    const summary = await connect3ID(seed);
    setDid(summary);
  };

  return (
    <Providers>
      <Box width={780} mr="auto" ml="auto" mt={5}>
        <Heading mb={5}>Did Generator</Heading>
        <Text>
          This tool helps you to first enter, or generate, a seed, before using
          it to create a DID using tools provided by Ceramic.
        </Text>

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
              <Box display="flex" mt={5}>
                <ConnectButton />
                <Button
                  ml={3}
                  colorScheme="orange"
                  onClick={generateSeed}
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
          <Box display={"flex"} mb={3}>
            <Textarea
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              mr={3}
            />
            <Button
              colorScheme="orange"
              onClick={() => generateDid(seed)}
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
    </Providers>
  );
}
