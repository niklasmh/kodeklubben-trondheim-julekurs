import { useCallback } from 'react'
import Editor from '@monaco-editor/react'
import styled from 'styled-components'
import { BlocklyWorkspace } from 'react-blockly'
import Blockly from 'blockly'
import 'blockly/python'
import { useStore } from '../store'
import { CSSShadows } from '../constants'
import './blockly-custom-blocks'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  .monaco-editor {
    overflow: hidden;
    border-radius: 8px;
    ${CSSShadows.large}
  }
`

export function CodeEditor({ above, language = 'python', ...props }) {
  const pythonCode = useStore((state) => state.pythonCode)
  const setPythonCode = useStore((state) => state.setPythonCode)
  const javascriptCode = useStore((state) => state.javascriptCode)
  const setJavascriptCode = useStore((state) => state.setJavascriptCode)

  return (
    <Container>
      {above}
      <Editor
        height="400px"
        width="640px"
        theme="vs-dark"
        language={language}
        value={language === 'python' ? pythonCode : javascriptCode}
        onChange={(code) => (language === 'python' ? setPythonCode(code) : setJavascriptCode(code))}
        className="monaco-editor"
        {...props}
        options={{
          scrollBeyondLastLine: false,
          wordWrap: true,
          renderWhitespace: 'boundary',
          ...(props.options || {}),
        }}
      />
    </Container>
  )
}

const StyledBlocklyWorkspace = styled(BlocklyWorkspace)`
  width: 100%;
  min-width: 640px;
  height: 400px;
  overflow: hidden;
  border-radius: 8px;
`

const toolboxConfiguration = {
  kind: 'flyoutToolbox',
  contents: [
    {
      kind: 'block',
      type: 'fremover',
    },
    {
      kind: 'block',
      type: 'høyre',
    },
    {
      kind: 'block',
      type: 'venstre',
    },
    {
      kind: 'block',
      type: 'farge',
    },
    {
      kind: 'block',
      type: 'controls_repeat',
    },
  ],
}

const workspaceConfiguration = {
  grid: {
    spacing: 20,
    length: 3,
    colour: '#ccc',
    snap: true,
  },
}

export function BlocklyEditor({ above, ...props }) {
  const setBlocklyPythonCode = useStore((state) => state.setBlocklyPythonCode)
  const initialXml = useStore((state) => state.blocklyXml)
  const onXmlChange = useStore((state) => state.setBlocklyXml)

  const onWorkspaceChange = useCallback(
    (workspace) => {
      setBlocklyPythonCode(`from turtle import *\n` + Blockly.Python.workspaceToCode(workspace))
    },
    [setBlocklyPythonCode]
  )

  return (
    <Container>
      {above}
      <StyledBlocklyWorkspace
        {...{ initialXml, toolboxConfiguration, workspaceConfiguration, onWorkspaceChange, onXmlChange }}
        {...props}
      />
    </Container>
  )
}
