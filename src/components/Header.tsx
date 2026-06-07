import React from 'react';
import { Box, Text } from 'ink';

interface HeaderProps {
  email: string;
  repo: string;
  branch: string;
  isBranchSelectorOpen: boolean;
}

export function Header({ email, repo, branch, isBranchSelectorOpen }: HeaderProps) {
  return (
    <Box borderStyle="single" borderColor="blue" paddingX={1} justifyContent="space-between">
      <Box flexShrink={1} paddingRight={2}>
        <Text>
          <Text color="blue">git-messenger</Text>
          <Text color="gray"> · </Text>
          <Text>{email}</Text>
          <Text color="gray"> · </Text>
          <Text>repo:{repo}</Text>
          <Text color="gray"> · </Text>
          <Text color={isBranchSelectorOpen ? 'green' : 'white'}>branch:{branch}</Text>
        </Text>
      </Box>
      <Box flexShrink={0}>
        <Text color="gray">[Ctrl+B branches]</Text>
      </Box>
    </Box>
  );
}
