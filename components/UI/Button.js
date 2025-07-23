// import { useState, useEffect, useCallback } from 'react';

import classNames from "classnames";

export default function ArticlesButton(props) {

    const {
        size,
        variant,
        style,
        // Can just use small instead of size="sm"
        small,
        large,
        onClick,
        className,
        disabled,
        active,
        type,
        onMouseDown,
        onMouseUp,
        onMouseLeave,
        onTouchStart,
        onTouchEnd
    } = props;

    return (
        <button
            {
                ...(type && {type: 'submit'})
            }
            disabled={disabled}
            style={style}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            // data-react-component='true'
            className={
                classNames(
                    `btn ${variant ? `btn-${variant}` : 'btn-articles'}`,
                    {
                        [className]: className,
                        'btn-lg': large,
                        'btn-sm': small,
                        'active': active,
                        [`btn-${size}`]: size 
                    }
                )
            }
            onClick={onClick}
        >
            {props.children}
        </button>
    )
}