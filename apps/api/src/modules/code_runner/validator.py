import ast

from .errors import UnsafeCodeError

BLOCKED_IMPORTS = {"os", "sys", "subprocess", "socket", "pathlib"}
BLOCKED_CALLS = {"eval", "exec", "compile", "open", "input"}


def validate_code(code: str) -> None:
    """
    Phase-1 static validation using AST.

    This is intentionally minimal and explicit. It is not a complete sandbox.
    """
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        raise UnsafeCodeError(f"Syntax error: {e}") from None

    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                root = (alias.name or "").split(".", 1)[0]
                if root in BLOCKED_IMPORTS:
                    raise UnsafeCodeError(f"Import blocked: {root}")

        elif isinstance(node, ast.ImportFrom):
            module = (node.module or "").split(".", 1)[0]
            if module in BLOCKED_IMPORTS:
                raise UnsafeCodeError(f"Import blocked: {module}")

        elif isinstance(node, ast.Call):
            # Block direct builtin calls like: eval("..."), open("...")
            if isinstance(node.func, ast.Name) and node.func.id in BLOCKED_CALLS:
                raise UnsafeCodeError(f"Call blocked: {node.func.id}")

            # Block explicit builtins.<name>(...) calls.
            if (
                isinstance(node.func, ast.Attribute)
                and isinstance(node.func.value, ast.Name)
                and node.func.value.id == "builtins"
                and node.func.attr in BLOCKED_CALLS
            ):
                raise UnsafeCodeError(f"Call blocked: builtins.{node.func.attr}")

