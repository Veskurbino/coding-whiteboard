'use client';
import { Button, HStack, Input, ButtonGroup, IconButton, useColorMode } from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { useWhiteboardStore } from '../state/whiteboardStore';
import { useState } from 'react';

export function Toolbar() {
  const { removeElements, selectedIds, setSessionId, setTool, activeTool, currentUser, setUserName } = useWhiteboardStore();
  const getPNG = useWhiteboardStore((s: any) => s.getPNGDataURL);
  const getDoc = useWhiteboardStore((s: any) => s.getDocument);
  const [sessionInput, setSessionInput] = useState('');
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <div className="w-full border-b p-2" style={{ background: 'var(--chakra-colors-chakra-body-bg)' }}>
      <HStack spacing={3}>
        <ButtonGroup isAttached>
          <Button variant={activeTool === 'select' ? 'solid' : 'outline'} onClick={() => setTool('select')}>Select</Button>
          <Button variant={activeTool === 'pan' ? 'solid' : 'outline'} onClick={() => setTool('pan')}>Pan</Button>
          <Button variant={activeTool === 'note' ? 'solid' : 'outline'} onClick={() => setTool('note')}>Note</Button>
          <Button variant={activeTool === 'code' ? 'solid' : 'outline'} onClick={() => setTool('code')}>Code</Button>
          <Button variant={activeTool === 'arrow' ? 'solid' : 'outline'} onClick={() => setTool('arrow')}>Arrow</Button>
        </ButtonGroup>
        <Button colorScheme="red" variant="outline" onClick={() => selectedIds.length && removeElements(selectedIds)} disabled={!selectedIds.length}>Delete</Button>
        <div className="ml-auto flex items-center gap-2">
          <Input size="sm" placeholder="Your name" value={currentUser.name} onChange={(e) => setUserName(e.target.value)} width="48" />
          <Input size="sm" placeholder="Session ID" value={sessionInput} onChange={(e) => setSessionInput(e.target.value)} />
          <Button size="sm" onClick={() => sessionInput && setSessionId(sessionInput)}>Join</Button>
          <Button size="sm" variant="outline" onClick={() => {
            const url = getPNG?.();
            if (!url) return;
            const a = document.createElement('a');
            a.href = url;
            a.download = `whiteboard-${Date.now()}.png`;
            a.click();
          }}>Export PNG</Button>
          <Button size="sm" variant="outline" onClick={() => {
            const doc = getDoc?.();
            const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `whiteboard-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}>Export JSON</Button>
          <IconButton aria-label="Toggle color mode" size="sm" onClick={toggleColorMode} icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />} />
        </div>
      </HStack>
    </div>
  );
}


