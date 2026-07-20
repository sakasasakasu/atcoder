#include <bits/stdc++.h>
#define rep(i, n) for (int i = 0; i < (n); i++)
using namespace std;

int main() {
    int N;
    cin >> N;
    int A, B;
    string S;
    int keep = 0, take = 0;
    rep(i, N) {
        cin >> A >> B >> S;
        if (S == "keep") {
            keep += B - A;
        } else {
            take += B - A;
        }
    }
    cout << keep << endl;

}
