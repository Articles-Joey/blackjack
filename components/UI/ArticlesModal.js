import { useState } from "react";

import { Button, Modal } from "react-bootstrap"
import ArticlesButton from "./Button";

export default function ArticlesModal({
    show,
    setShow,
    action,
    actionText,
    closeAction,
    closeText,
    title,
    children,
    backdrop,
    disableClose,
    disableAction,
    className,
    modalClassName,
    centered,
    scrollable,
    size,
    actionVariant
}) {

    const [showModal, setShowModal] = useState(true)

    // Notes
    // Assumes always centered
    // Assumes always scrollable
    // Just pass false to disable

    // return (
    //     null
    // )

    return (
        <>
            <Modal
                className={`articles-modal ${modalClassName}`}
                size={size || 'md'}
                show={showModal}
                centered={centered === false ? false : true}
                backdrop={backdrop}
                scrollable={scrollable === false ? false : true}
                onExited={() => {
                    setShow(false)
                }}
                onHide={() => {

                    if (!disableClose) {
                        setShowModal(false)
                    }

                }}
            >

                <Modal.Header closeButton={disableClose ? false : true}>
                    <Modal.Title>{title ? title : 'Info'}</Modal.Title>
                </Modal.Header>

                <Modal.Body className={className}>

                    {children ? children : '...'}

                </Modal.Body>

                <Modal.Footer className="justify-content-between">

                    {!action && <div></div>}

                    <div>
                        {(!disableClose || closeAction) &&
                            <ArticlesButton
                                variant="outline-dark"
                                onClick={() => {

                                    if (closeAction) {
                                        closeAction()
                                    } else {
                                        setShowModal(false)
                                    }
                                    
                                }}
                            >
                                {/* Close */}
                                {closeText || 'Close'}
                            </ArticlesButton>
                        }
                    </div>

                    {action &&
                        <ArticlesButton
                            variant={actionVariant ? actionVariant : "articles"}
                            disabled={disableAction}
                            onClick={() => {
                                console.log('action')
                                action(setShowModal)
                            }}
                        >
                            {actionText || 'Continue'}
                        </ArticlesButton>
                    }

                </Modal.Footer>

            </Modal>
        </>
    )

}