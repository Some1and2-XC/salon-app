{
    description = "Salon App Development Shell";

    inputs = {
        nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.11";
    };

    outputs = {
        self,
        nixpkgs,
    }:
    let

      system = "x86_64-linux"; # change if needed
      pkgs = import nixpkgs { inherit system; };

    in
    {

      devShells.${system}.default = pkgs.mkShell {
          buildInputs = [

            pkgs.nodejs_24

          ];

          shellHook = ''
            # Set the status
            export PS1="\n\[\033[1;31m\](salon-app-shell) \[\033[1;34m\]\w\[\033[0m\] \n$ "
            # Make colors work
            export TERM="xterm"
          '';

      };

    };

}
