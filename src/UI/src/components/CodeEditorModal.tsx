'use client';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, Select } from '@chakra-ui/react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export function CodeEditorModal({ isOpen, initialCode, language, onSave, onClose }: { isOpen: boolean; initialCode: string; language: string; onSave: (code: string, language: string) => void; onClose: () => void }) {
  const [code, setCode] = useState(initialCode);
  const [lang, setLang] = useState(language);
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Code</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <div className="flex items-center gap-2 mb-2">
            <Select width="48" value={lang} onChange={(e) => setLang(e.target.value)}>
              <option value="typescript">TypeScript</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
            </Select>
          </div>
          <div style={{ height: '60vh' }}>
            <MonacoEditor language={lang} value={code} onChange={(value) => setCode(value || '')} theme="vs-dark" options={{ minimap: { enabled: false } }} />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={onClose}>Cancel</Button>
          <Button colorScheme="blue" onClick={() => onSave(code, lang)}>Save</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}


