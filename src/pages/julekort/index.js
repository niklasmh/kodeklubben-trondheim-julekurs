import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { setOptions, setEngine, runCode } from 'client-side-python-runner'
import { CodeEditor, BlocklyEditor } from '../../components/CodeEditor'
import { Graphics } from '../../components/Graphics'
import { Button } from '../../components/Button'
import { useStore } from '../../store'

export function JulekortSide() {
  const pythonCode = useStore((state) => state.pythonCode)
  const setPythonCode = useStore((state) => state.setPythonCode)
  const preDefinedPythonCode = useStore((state) => state.preDefinedPythonCode)
  const extraPythonCodeForTheBrowserRendering = useStore((state) => state.extraPythonCodeForTheBrowserRendering)
  const blocklyPythonCode = useStore((state) => state.blocklyPythonCode)
  const downloadablePythonCode = useStore((state) => state.downloadablePythonCode)
  const blocklyXml = useStore((state) => state.blocklyXml)
  const addLog = useStore((state) => state.addLog)
  const [pythonEngineLoading, setLoadingPython] = useState(false)
  const editorMode = useStore((state) => state.editorMode)
  const editor = useStore((state) => state.editor)
  const setEditorMode = useStore((state) => state.setEditorMode)
  const setError = useStore((state) => state.setError)
  const clearError = useStore((state) => state.clearError)
  const pythonErrorLineNumberOffset = useStore((state) => state.pythonErrorLineNumberOffset)

  useEffect(() => {
    setOptions({
      output: (item) => {
        addLog(item)
        console.log(item)
      },
      error: null,
      onLoading: (engine) => setLoadingPython(engine),
      onLoaded: () => {
        setLoadingPython(false)
      },
      loadVariablesBeforeRun: true,
      storeVariablesAfterRun: true,
    })
    setEngine('skulpt', '1.0.0')
  }, [addLog])

  const EditorHeader = ({ runCodeFunction }) => (
    <StyledEditorHeader>
      {editorMode === 'python' && (
        <>
          <Button onClick={() => setEditorMode('blockly')}>
            Gå tilbake til blokker <i className="fas fa-shapes" />
          </Button>
        </>
      )}
      {editorMode === 'blockly' && (
        <Button
          onClick={() => {
            setEditorMode('python')
            setPythonCode(downloadablePythonCode)
          }}
        >
          Gjør om til Python <i className="fas fa-code" />
        </Button>
      )}
      {editorMode === 'python' && false && (
        <>
          <Button onClick={() => download('julekort.py', pythonCode)}>
            Last ned Python-koden som en fil <i className="fas fa-download" />
          </Button>
        </>
      )}
      {editorMode === 'blockly' && false && (
        <>
          <Button onClick={() => download('julekort-blockly.xml', blocklyXml)}>
            Last ned blokkene som en fil <i className="fas fa-download" />
          </Button>
          <Button onClick={() => download('julekort.py', downloadablePythonCode)}>
            Last ned blokkene som Python-kode <i className="fas fa-code" /> <i className="fas fa-download" />
          </Button>
        </>
      )}
      <RunButton onClick={runCodeFunction}>
        Kjør koden <i className="fas fa-play" />
      </RunButton>
    </StyledEditorHeader>
  )

  const download = (filename, text) => {
    const linkElement = document.createElement('a')
    linkElement.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(text)
    linkElement.download = filename
    linkElement.click()
  }

  return (
    <Container>
      <Graphics />
      {editorMode === 'python' ? (
        <CodeEditor
          language="python"
          above={
            <EditorHeader
              runCodeFunction={async () => {
                await setEngine('skulpt', '1.0.0')
                clearError()
                if (editor) {
                  window.monaco.editor.setModelMarkers(
                    'getModel' in editor ? editor.getModel() : editor,
                    'python-editor',
                    []
                  )
                }
                try {
                  await runCode(preDefinedPythonCode + extraPythonCodeForTheBrowserRendering + pythonCode, {
                    turtleGraphics: {
                      target: 'julekort-grafikk-turtle',
                      width: 1600,
                      height: 1600,
                      assets: {
                        'nisse-old-female': process.env.PUBLIC_URL + '/nisse-old-female.png',
                        'nisse-old-male': process.env.PUBLIC_URL + '/nisse-old-male.png',
                      },
                    },
                  })
                } catch (error) {
                  setError(error)
                  console.error(error)
                  if (error.lineNumber && error.lineNumber > pythonErrorLineNumberOffset && editor) {
                    const lineNumberInEditor = error.lineNumber - pythonErrorLineNumberOffset
                    window.monaco.editor.setModelMarkers(
                      'getModel' in editor ? editor.getModel() : editor,
                      'python-editor',
                      [
                        {
                          startLineNumber: lineNumberInEditor,
                          startColumn: 0,
                          endLineNumber: lineNumberInEditor + 1,
                          endColumn: 0,
                          message: error.type + ': ' + error.message,
                          severity: 3,
                          source: '',
                        },
                      ]
                    )
                  }
                }
              }}
            />
          }
        />
      ) : (
        <BlocklyEditor
          above={
            <EditorHeader
              runCodeFunction={async () => {
                await setEngine('skulpt', '1.0.0')
                clearError()
                try {
                  await runCode(blocklyPythonCode, {
                    turtleGraphics: {
                      target: 'julekort-grafikk-turtle',
                      width: 1600,
                      height: 1600,
                      assets: {
                        'nisse-old-female': process.env.PUBLIC_URL + '/nisse-old-female.png',
                        'nisse-old-male': process.env.PUBLIC_URL + '/nisse-old-male.png',
                      },
                    },
                  })
                } catch (error) {
                  setError(error)
                  console.error(error)
                }
              }}
            />
          }
        />
      )}
      {pythonEngineLoading ? `Laster inn Python (${pythonEngineLoading}) ...` : ''}
    </Container>
  )
}

const Container = styled.div`
  position: relative;
  text-align: center;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 16px;
`

const StyledEditorHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 8px;
`

const RunButton = styled(Button)`
  background-color: #080;
  color: #fff;

  :hover {
    background-color: #060;
  }
`
